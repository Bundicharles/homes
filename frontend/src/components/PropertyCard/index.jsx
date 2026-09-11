import { useState, useEffect, useMemo } from 'react';
import { Heart, Calendar, Share2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { generateWhatsAppUrl, getUploadBase } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { favoritesAPI, interestedAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import VatExcl from '@/components/VatExcl';
import {
  getStoredFavorites,
  setStoredFavorites,
  getStoredInterested,
  setStoredInterested,
} from '@/utils/authStorage';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Extract all property images into full URLs for slideshow
  const imageList = useMemo(() => {
    let list = [];
    if (Array.isArray(property.images) && property.images.length > 0) {
      list = property.images.map((img) =>
        typeof img === 'string' ? img : img.filename
      );
    } else if (typeof property.all_images === 'string' && property.all_images.trim().length > 0) {
      list = property.all_images.split(',').map((img) => img.trim()).filter(Boolean);
    } else if (property.primary_image) {
      list = [property.primary_image];
    }

    if (list.length === 0) {
      return ['https://placehold.co/600x400?text=No+Image'];
    }

    return list.map((filename) => {
      if (filename.startsWith('http')) return filename;
      
      // If it already contains the path (e.g. backend/uploads/properties/... or uploads/properties/...)
      const cleaned = filename.replace(/^(\/?backend)?\/?uploads\//i, '');
      
      // Ensure it goes to properties/ folder if it's just a filename
      const finalPath = cleaned.startsWith('properties/') ? cleaned : `properties/${cleaned}`;
      
      return `${getUploadBase()}uploads/${finalPath}`;
    });
  }, [property]);

  // Auto-slide image timer (cycles automatically every 3.5 seconds)
  useEffect(() => {
    if (imageList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imageList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [imageList.length, isPaused]);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      if (property.is_favorited) {
        favoritesAPI.remove(property.favorite_id).catch(() => {});
      } else {
        favoritesAPI.add({ property_id: property.id }).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } else {
      const favs = getStoredFavorites();
      if (favs.includes(property.id)) {
        setStoredFavorites(favs.filter((id) => id !== property.id));
      } else {
        setStoredFavorites([...favs, property.id]);
      }
      queryClient.invalidateQueries({ queryKey: ['guest-favorites'] });
    }
  };

  const handleRequestViewing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/properties/${property.slug || property.id}?view=1`);
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const whatsappNumber = settings.contact_whatsapp || '+254700000001';
    const message = `Hello, I am interested in:\n\nProperty: ${property.name}\nLocation: ${property.location}\nPrice: ${property.currency || 'KES'} ${Number(property.price || 0).toLocaleString()}\n\nWebsite: ${window.location.origin}/properties/${property.slug}`;
    window.open(generateWhatsAppUrl(whatsappNumber, message), '_blank');
  };

  const statusLabels = {
    Available: 'Available',
    Reserved: 'Reserved',
    'Under Offer': 'Under Offer',
    Sold: 'Sold',
    Published: 'Published',
  };

  return (
    <Link to={`/properties/${property.slug}`} className="group block h-full">
      <div className="card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl group-hover:-translate-y-2 flex flex-col h-full min-h-[620px] sm:min-h-[680px] md:min-h-[720px] border border-border/80 bg-surface">
        {/* Full-Bleed Dominant Grand Image Display & Slide Gallery */}
        <div
          className="relative h-[380px] sm:h-[440px] md:h-[480px] lg:h-[500px] w-full overflow-hidden bg-surface-hover group/slider flex-shrink-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <img
            src={imageList[currentSlide]}
            alt={property.name || 'Product Image'}
            className="w-full h-full object-cover object-center block transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />

          {property.featured && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-accent text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-lg backdrop-blur-md z-10">
              Featured
            </div>
          )}
          {property.verification_status === 'Verified' && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-success/95 text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-lg flex items-center backdrop-blur-md z-10">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}

          {/* Interactive Slides Navigation Arrows & Indicators */}
          {imageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev - 1 + imageList.length) % imageList.length);
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 text-white opacity-80 sm:opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/80 z-20 backdrop-blur-sm"
                aria-label="Previous image slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev + 1) % imageList.length);
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 text-white opacity-80 sm:opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/80 z-20 backdrop-blur-sm"
                aria-label="Next image slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {imageList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-white w-4' : 'bg-white/50 w-1.5 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between gap-3.5 sm:gap-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
              <h3 className="font-bold text-lg sm:text-xl text-text line-clamp-1 group-hover:text-primary transition-smooth">
                {property.name}
              </h3>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-md shrink-0">
                {property.type_name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted line-clamp-1 mb-2.5 sm:mb-3">{property.location}</p>

            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                {property.currency || 'KES'} {Number(property.price || 0).toLocaleString()}
              </p>
              <VatExcl />
            </div>
          </div>

          {property.type_slug === 'plot' || property.type_slug === 'land' || property.type_name?.toLowerCase().includes('plot') || property.type_name?.toLowerCase().includes('land') ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-4 text-center bg-surface/80 p-2 sm:p-2.5 rounded-xl border border-border">
              <div className="flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-bold text-text truncate">
                  {Number(property.land_size) > 0
                    ? Number(property.land_size) >= 4000
                      ? `${(Number(property.land_size) / 4046.86).toFixed(1)} Ac`
                      : Number(property.land_size) >= 1800
                      ? '1/2 Acre'
                      : Number(property.land_size) >= 900
                      ? '1/4 Acre'
                      : Number(property.land_size) >= 400
                      ? '1/8 Acre'
                      : `${Number(property.land_size)} sqm`
                    : '50×100 ft'}
                </span>
                <span className="text-[10px] text-muted uppercase font-medium">Size</span>
              </div>
              <div className="flex flex-col justify-center border-x border-border/60 px-1">
                <span className="text-xs sm:text-sm font-bold text-text truncate">
                  {property.county || property.town || 'Kenya'}
                </span>
                <span className="text-[10px] text-muted uppercase font-medium">County</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs sm:text-sm font-bold text-emerald-600 truncate">
                  Ready Title
                </span>
                <span className="text-[10px] text-muted uppercase font-medium">Deed</span>
              </div>
            </div>
          ) : (Number(property.bedrooms) > 0 || Number(property.bathrooms) > 0 || Number(property.parking_spaces) > 0) ? (
            <div className="grid grid-cols-3 gap-2 mb-2 sm:mb-4 text-center bg-surface/50 p-2 rounded-xl border border-border/60">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-text">{property.bedrooms || 0}</span>
                <span className="text-[11px] sm:text-xs text-muted">Beds</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-text">{property.bathrooms || 0}</span>
                <span className="text-[11px] sm:text-xs text-muted">Baths</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-text">{property.parking_spaces || 0}</span>
                <span className="text-[11px] sm:text-xs text-muted">Park</span>
              </div>
            </div>
          ) : property.description ? (
            <div className="mb-2 sm:mb-4 bg-surface/40 p-2 sm:p-2.5 rounded-xl border border-border/60">
              <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                {property.description.replace(/<[^>]+>/g, '').trim()}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 sm:mb-4 bg-surface/50 p-2 rounded-xl border border-border/60 text-xs text-muted">
              <MapPin size={14} className="text-primary flex-shrink-0" />
              <span className="truncate">{property.location || property.county || 'Available Now'}</span>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-3 border-t border-border space-y-2.5 sm:space-y-3">
            {/* Primary action buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {/* Favourite */}
              <button
                onClick={handleFavorite}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  property.is_favorited
                    ? 'bg-error text-white border-error shadow-sm'
                    : 'bg-surface border-border text-muted hover:bg-error/10 hover:text-error hover:border-error/40'
                }`}
                aria-label="Toggle favourite"
              >
                <Heart size={14} className={property.is_favorited ? 'fill-white' : ''} />
                <span>{property.is_favorited ? 'Saved' : 'Save'}</span>
              </button>

              {/* Request Viewing */}
              <button
                onClick={handleRequestViewing}
                className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
                aria-label="Request a viewing"
                title="Request a Viewing"
              >
                <Calendar size={14} className="flex-shrink-0" />
                <span className="truncate">Viewing</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#1ebe5d] text-white border border-[#25D366] hover:border-[#1ebe5d] transition-all duration-200 shadow-sm"
                aria-label="Enquire on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Status badge + Share row */}
            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                property.status === 'Available' ? 'bg-success/10 text-success' :
                property.status === 'Sold' ? 'bg-error/10 text-error' :
                property.status === 'Reserved' ? 'bg-warning/10 text-warning' :
                property.status === 'Under Offer' ? 'bg-orange-100 text-orange-800' :
                'bg-muted/10 text-muted'
              }`}>
                {statusLabels[property.status] || property.status}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url = `${window.location.origin}/properties/${property.slug}`;
                  navigator.clipboard.writeText(url);
                }}
                className="flex items-center gap-1 text-xs text-muted hover:text-secondary transition-smooth"
                aria-label="Copy link to share"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
