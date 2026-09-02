import { Heart, ShoppingCart, Share2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { generateWhatsAppUrl } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const primaryImage = property.primary_image
    ? `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${property.primary_image}`
    : 'https://placehold.co/600x400?text=No+Image';

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

  const handleInterested = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      interestedAPI.add({ property_id: property.id }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['interested'] });
    } else {
      const items = getStoredInterested();
      if (!items.includes(property.id)) {
        setStoredInterested([...items, property.id]);
      }
      queryClient.invalidateQueries({ queryKey: ['guest-interested'] });
    }
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

  const verificationLabels = {
    Verified: 'Verified',
    'Documents Submitted': 'Under Review',
    Pending: 'Pending',
    'Not Verified': 'Not Verified',
  };

  return (
    <Link to={`/properties/${property.slug}`} className="group block">
      <div className="card overflow-hidden transition-shadow duration-300 hover:shadow-card group-hover:translate-y-[-2px]">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-hover">
          <img
            src={primaryImage}
            alt={property.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {property.featured && (
            <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          {property.verification_status === 'Verified' && (
            <div className="absolute top-3 right-3 bg-success text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg text-text line-clamp-1 group-hover:text-primary transition-smooth">
              {property.name}
            </h3>
            <span className="text-xs font-medium bg-muted/10 text-muted px-2 py-1 rounded">
              {property.type_name}
            </span>
          </div>

          <p className="text-sm text-muted line-clamp-1 mb-3">{property.location}</p>

          <div className="flex items-center gap-2 mb-4">
            <p className="text-2xl font-bold text-primary">
              {property.currency || 'KES'} {Number(property.price || 0).toLocaleString()}
            </p>
            <VatExcl />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-text">{property.bedrooms || 0}</span>
              <span className="text-xs text-muted">Beds</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-text">{property.bathrooms || 0}</span>
              <span className="text-xs text-muted">Baths</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-text">{property.parking_spaces || 0}</span>
              <span className="text-xs text-muted">Park</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleFavorite}
                className="p-1.5 text-muted hover:text-error transition-smooth"
                aria-label="Toggle favorite"
              >
                <Heart
                  size={18}
                  className={property.is_favorited ? 'fill-error text-error' : ''}
                />
              </button>
              <button
                onClick={handleInterested}
                className="p-1.5 text-muted hover:text-primary transition-smooth"
                aria-label="Add to interested"
              >
                <ShoppingCart size={18} />
              </button>
              <button
                onClick={handleWhatsApp}
                className="p-1.5 text-muted hover:text-success transition-smooth"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2.01C6.48 2.01 2.03 6.46 2.03 12c0 2.12.56 4.16 1.6 5.92l-1.02 3.79c-.13.48.34.96.84.84l3.79-1.02c1.74 1.04 3.78 1.56 5.92 1.56 5.56 0 10.01-4.45 10.01-9.99S17.6 2.01 12.04 2.01zm5.28 13.74c-.29.8-1.69 1.46-2.35 1.58-.41.07-.57.12-.6.13-.03.02-.4.05-.77-.27-.37-.32-.53-.46-1.06-.79-.51-.32-1.65-.82-2.1-.84-.44-.01-.77-.15-.91-.32-.13-.15-2.58-3.63-3.05-4.5-.04-.07-.1-.17-.1-.28-.01-.1-.01-.21.05-.31.06-.1.17-.27.29-.15.11.12.67 1.01 1.89 2.74.26.47.52.91.88 1.32.08.09.66-1.12.96-1.59.31-.48.63-.99 1.02-1.55.08-.11.95-.47 1.86-.89.19-.08.5-.3.63-.41.12-.11.1.15.03.34v.01c.02.3-.14.7-.46 1.1-.02.03-.1.15-.2.27.04-.02.1-.07.16-.1.2-.08 2.12.81 3.94 1.76.52.23.88.38 1.11.56.23.18.36.55.2 1.09l-.02.06c-.06.23-.3.79-.86 1.21-.33.23-.49.53-.49.85 0 .32.16 0 2.04-2.69.14-.19.29-.31.45-.26.17.04 1.33.66 1.56 1.28.21.57.15 1.46-.08 2.18l-.02.04c-.03.08-.2.42-.45.79-.19.28-1.1.28-1.35.08-.25-.2-1.3-.59-1.56-.65-.03-.01-.05-.01-.06-.02 0 0-.01-.01-.01 0l-.01.01c-.03.24-.05.59.24 1.33.17.44.36.89.57 1.34.07.16.87 1.82.87 1.82z" />
        </svg>
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/properties/${property.slug}`;
                  navigator.clipboard.writeText(url);
                }}
                className="p-1.5 text-muted hover:text-secondary transition-smooth"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              property.status === 'Available' ? 'bg-success/10 text-success' :
              property.status === 'Sold' ? 'bg-error/10 text-error' :
              property.status === 'Reserved' ? 'bg-warning/10 text-warning' :
              property.status === 'Under Offer' ? 'bg-orange-100 text-orange-800' :
              'bg-muted/10 text-muted'
            }`}>
              {statusLabels[property.status] || property.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
