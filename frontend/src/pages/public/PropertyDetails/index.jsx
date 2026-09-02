import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { propertiesAPI, favoritesAPI, interestedAPI, viewingAPI, inquiriesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import PropertyGallery from '@/components/PropertyGallery';
import WhatsAppButton from '@/components/WhatsAppButton';
import VatExcl from '@/components/VatExcl';
import { Share2, Bed, Bath, Square, MapPin, Calendar, Ruler, CheckCircle, Send, Home, X, Loader2, Phone, Mail } from 'lucide-react';
import { formatPrice } from '@/utils';
import {
  getStoredFavorites,
  setStoredFavorites,
  getStoredInterested,
  setStoredInterested,
} from '@/utils/authStorage';
import { useQueryClient } from '@tanstack/react-query';

const PropertyDetails = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', message: '' });
  const [viewingForm, setViewingForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', preferred_date: '', preferred_time: '', message: '' });
  const [formSuccess, setFormSuccess] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['property', slug],
    queryFn: () => propertiesAPI.getBySlug(slug || ''),
    staleTime: 60000,
  });

  const property = data?.success ? data.data : null;

  const isFavorited = () => {
    if (isAuthenticated && property) {
      return property.is_favorited;
    }
    if (property) {
      const favs = getStoredFavorites();
      return favs.includes(property.id);
    }
    return false;
  };

  const handleFavorite = () => {
    if (!property) return;

    if (isAuthenticated) {
      favoritesAPI.add({ property_id: property.id }).catch(() => {});
    } else {
      const favs = getStoredFavorites();
      if (favs.includes(property.id)) {
        setStoredFavorites(favs.filter((id) => id !== property.id));
      } else {
        setStoredFavorites([...favs, property.id]);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  const handleInterested = () => {
    if (!property) return;

    if (isAuthenticated) {
      interestedAPI.add({ property_id: property.id }).catch(() => {});
    } else {
      const items = getStoredInterested();
      if (!items.includes(property.id)) {
        setStoredInterested([...items, property.id]);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['interested'] });
  };

  const inquiryMutation = useMutation({
    mutationFn: (data) => inquiriesAPI.submit(data),
    onSuccess: () => {
      setFormSuccess('inquiry');
      setShowInquiryModal(false);
      setInquiryForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', message: '' });
      setTimeout(() => setFormSuccess(''), 5000);
    },
  });

  const viewingMutation = useMutation({
    mutationFn: (data) => viewingAPI.submit(data),
    onSuccess: () => {
      setFormSuccess('viewing');
      setShowViewingModal(false);
      setViewingForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', preferred_date: '', preferred_time: '', message: '' });
      setTimeout(() => setFormSuccess(''), 5000);
    },
  });

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    inquiryMutation.mutate({ ...inquiryForm, property_id: property?.id, source: 'property_page' });
  };

  const handleViewingSubmit = (e) => {
    e.preventDefault();
    viewingMutation.mutate({ ...viewingForm, property_id: property?.id });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-[4/3] bg-muted/20 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted/20 rounded" />
            <div className="h-4 bg-muted/20 rounded w-3/4" />
            <div className="h-4 bg-muted/20 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="text-muted">The property you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const statusColors = {
    Available: 'bg-success/10 text-success',
    Reserved: 'bg-warning/10 text-warning',
    'Under Offer': 'bg-orange-100 text-orange-800',
    Sold: 'bg-error/10 text-error',
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'description', label: 'Description' },
    { id: 'features', label: 'Features' },
    { id: 'location', label: 'Location' },
    { id: 'documents', label: 'Documents' },
    { id: 'agent', label: 'Agent' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Home className="w-4 h-4" />
        <span>Home</span>
        <span>/</span>
        <span>Properties</span>
        <span>/</span>
        <span className="text-text">{property.name}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-text">{property.name}</h1>
          {property.featured && (
            <span className="badge badge-primary">Featured</span>
          )}
          {property.verification_status === 'Verified' && (
            <span className="badge badge-success">Verified</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted">
          <MapPin className="w-4 h-4" />
          <span>{property.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PropertyGallery images={property.images || []} propertyName={property.name} />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(property.price, property.currency)}
              </div>
              <VatExcl />
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusColors[property.status] || 'bg-muted/10 text-muted'}`}>
              {property.status}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-semibold">{property.bedrooms}</span>
                  <span className="text-xs text-muted ml-1">Bedrooms</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-semibold">{property.bathrooms}</span>
                  <span className="text-xs text-muted ml-1">Bathrooms</span>
                </div>
              </div>
              {property.house_size && (
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold">{parseFloat(property.house_size).toFixed(0)}</span>
                    <span className="text-xs text-muted ml-1">m² Built</span>
                  </div>
                </div>
              )}
              {property.land_size && property.land_size > 0 && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold">{parseFloat(property.land_size).toFixed(0)}</span>
                    <span className="text-xs text-muted ml-1">m² Land</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFavorite}
                className={`btn flex-1 ${isFavorited() ? 'bg-error/10 text-error' : 'btn-outline'}`}
              >
                {isFavorited() ? 'Remove Favorite' : 'Add to Favorites'}
              </button>
              <WhatsAppButton property={property} className="flex-1" />
            </div>

            <button
              onClick={handleInterested}
              className="btn btn-outline w-full mt-3"
            >
              Add to Interested Properties
            </button>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-text mb-4">Property Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {property.type_name && <div><span className="text-muted">Type:</span> <span className="text-text">{property.type_name}</span></div>}
              {property.furnishing_status && <div><span className="text-muted">Furnishing:</span> <span className="text-text">{property.furnishing_status}</span></div>}
              {property.year_built && <div><span className="text-muted">Year Built:</span> <span className="text-text">{property.year_built}</span></div>}
              {property.floors && <div><span className="text-muted">Floors:</span> <span className="text-text">{property.floors}</span></div>}
              {property.parking_spaces !== undefined && <div><span className="text-muted">Parking:</span> <span className="text-text">{property.parking_spaces} spaces</span></div>}
              {property.estate && <div className="col-span-2"><span className="text-muted">Estate:</span> <span className="text-text">{property.estate}</span></div>}
              {property.county && <div><span className="text-muted">County:</span> <span className="text-text">{property.county}</span></div>}
              {property.town && <div><span className="text-muted">Town:</span> <span className="text-text">{property.town}</span></div>}
            </div>
          </div>

          {property.agents && property.agents.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4">Assigned Agent</h3>
              <div className="flex items-center gap-4">
                <img
                  src={property.agents[0].photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.agents[0].name || 'Agent')}&background=2563eb&color=fff`}
                  alt={property.agents[0].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold">{property.agents[0].name}</h4>
                  <p className="text-sm text-muted">{property.agents[0].specialization || 'Real Estate Agent'}</p>
                  <p className="text-sm">{property.agents[0].phone}</p>
                  <p className="text-sm">{property.agents[0].email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://wa.me/${(property.agents[0].phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-border">
        <nav className="flex space-x-1 lg:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Property Type</span><span>{property.type_name}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Location</span><span>{property.location}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted">County</span><span>{property.county}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Price</span><span className="font-semibold">{formatPrice(property.price, property.currency)}</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Bedrooms</span><span>{property.bedrooms}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Bathrooms</span><span>{property.bathrooms}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Parking</span><span>{property.parking_spaces}</span></div>
                {property.house_size && <div className="flex justify-between py-2 border-b"><span className="text-muted">House Size</span><span>{property.house_size} m²</span></div>}
                {property.land_size && property.land_size > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted">Land Size</span><span>{property.land_size} m²</span></div>}
                <div className="flex justify-between py-2 border-b"><span className="text-muted">Views</span><span>{property.views_count || 0}</span></div>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div dangerouslySetInnerHTML={{ __html: property.description || '<p>No description available.</p>' }} className="prose max-w-none" />
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.features && property.features.length > 0 ? (
                property.features.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted">No features listed for this property.</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Documentation</h3>
              {property.documents && property.documents.length > 0 ? (
                property.documents.map((doc) => (
                  <div key={doc.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{doc.title}</h4>
                      <p className="text-sm text-muted">{doc.description}</p>
                      <p className="text-xs text-muted">Type: {doc.document_type} | Size: {Math.round(doc.file_size / 1024)} KB</p>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || '/api'}/documents/${doc.id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View Document
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-muted">No documents available for this property.</p>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Location</h3>
              <p className="text-muted">
                {property.address || property.location}, {property.town}, {property.county}, Kenya
              </p>
              {property.latitude && property.longitude && (
                <div className="aspect-[16/9] bg-surface rounded-lg border border-border flex items-center justify-center">
                  <p className="text-muted">Map: {property.latitude}, {property.longitude}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold mb-4">Interested in This Property?</h3>

        {formSuccess === 'inquiry' && (
          <div className="mb-4 p-3 rounded-xl bg-success/10 text-success text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Your inquiry has been sent! We'll be in touch shortly.
          </div>
        )}
        {formSuccess === 'viewing' && (
          <div className="mb-4 p-3 rounded-xl bg-success/10 text-success text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Viewing request submitted! We'll confirm your appointment.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WhatsAppButton property={property} className="w-full justify-center" />
          <button onClick={() => setShowInquiryModal(true)} className="btn btn-outline w-full justify-center">
            <Send className="w-4 h-4 mr-2" />
            Send Inquiry
          </button>
          <button onClick={() => setShowViewingModal(true)} className="btn btn-outline w-full justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Request Viewing
          </button>
        </div>
      </div>

      {/* INQUIRY MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-text">Send an Inquiry</h3>
              <button onClick={() => setShowInquiryModal(false)} className="p-2 rounded-lg hover:bg-surface-hover text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInquirySubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
                  <input type="text" value={inquiryForm.name} onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})} className="input" required placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Email *</label>
                  <input type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})} className="input" required placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
                <input type="tel" value={inquiryForm.phone} onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})} className="input" placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Subject</label>
                <input type="text" value={inquiryForm.subject} onChange={(e) => setInquiryForm({...inquiryForm, subject: e.target.value})} className="input" placeholder={`Inquiry about ${property.name}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Message *</label>
                <textarea rows={4} value={inquiryForm.message} onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} className="input" required placeholder="Tell us what you'd like to know about this property..." />
              </div>
              {inquiryMutation.isError && (
                <p className="text-sm text-error">{inquiryMutation.error?.message || 'Failed to send. Please try again.'}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowInquiryModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={inquiryMutation.isPending} className="btn btn-primary flex items-center gap-2">
                  {inquiryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWING REQUEST MODAL */}
      {showViewingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-text">Request a Property Viewing</h3>
              <button onClick={() => setShowViewingModal(false)} className="p-2 rounded-lg hover:bg-surface-hover text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleViewingSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
                  <input type="text" value={viewingForm.name} onChange={(e) => setViewingForm({...viewingForm, name: e.target.value})} className="input" required placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Email *</label>
                  <input type="email" value={viewingForm.email} onChange={(e) => setViewingForm({...viewingForm, email: e.target.value})} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
                <input type="tel" value={viewingForm.phone} onChange={(e) => setViewingForm({...viewingForm, phone: e.target.value})} className="input" placeholder="+254 7XX XXX XXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Preferred Date *</label>
                  <input type="date" value={viewingForm.preferred_date} onChange={(e) => setViewingForm({...viewingForm, preferred_date: e.target.value})} className="input" required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Preferred Time</label>
                  <select value={viewingForm.preferred_time} onChange={(e) => setViewingForm({...viewingForm, preferred_time: e.target.value})} className="input">
                    <option value="">Any time</option>
                    <option value="morning">Morning (8am–12pm)</option>
                    <option value="afternoon">Afternoon (12pm–5pm)</option>
                    <option value="evening">Evening (5pm–7pm)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Additional Notes</label>
                <textarea rows={3} value={viewingForm.message} onChange={(e) => setViewingForm({...viewingForm, message: e.target.value})} className="input" placeholder="Any special requests or questions..." />
              </div>
              {viewingMutation.isError && (
                <p className="text-sm text-error">{viewingMutation.error?.message || 'Failed to submit. Please try again.'}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowViewingModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={viewingMutation.isPending} className="btn btn-primary flex items-center gap-2">
                  {viewingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  <span>{viewingMutation.isPending ? 'Submitting...' : 'Book Viewing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
          }}
          className="flex items-center gap-2 text-muted hover:text-primary"
        >
          <Share2 className="w-4 h-4" />
          Share this property
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;
