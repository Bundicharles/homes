import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertiesAPI, interestedAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import PropertyCard from '@/components/PropertyCard';
import VatExcl from '@/components/VatExcl';
import { EmptyState, LoadingSkeleton } from '@/components/Modal';
import {
  getStoredInterested,
  setStoredInterested,
} from '@/utils/authStorage';
import { ShoppingCart, Trash2 } from 'lucide-react';

const InterestedProperties = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const businessName = settings.business_name || 'Prime Realty Kenya';

  useEffect(() => {
    document.title = `Interested Properties | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'View properties you have expressed interest in and manage your list.');
    }
  }, [businessName]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['interested'],
    queryFn: () => interestedAPI.getAll(),
    enabled: isAuthenticated,
  });

  const interested = data?.success ? (data.data.data || data.data) : [];

  const removeMutation = useMutation({
    mutationFn: (id) => interestedAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interested'] });
    },
  });

  const handleRemoveLoggedIn = (id) => {
    removeMutation.mutate(id);
  };

  const handleRemoveGuest = (propertyId) => {
    const items = getStoredInterested();
    const newItems = items.filter((id) => id !== propertyId);
    setStoredInterested(newItems);
    queryClient.invalidateQueries({ queryKey: ['guest-interested'] });
  };

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['guest-interested-properties'],
    queryFn: () => propertiesAPI.getAll({ ids: getStoredInterested().join(',') }),
    enabled: !isAuthenticated && getStoredInterested().length > 0,
  });

  const guestInterested = propertiesData?.success
    ? (propertiesData.data.data || propertiesData.data)
    : [];

  const isLoadingRemove = removeMutation.isPending;

  if (isLoading || propertiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-6">Interested Properties</h1>
        <LoadingSkeleton count={8} type="property-card" />
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text">Interested Properties</h1>
            <p className="text-muted mt-1">
              {isAuthenticated
                ? `${interested.length} ${interested.length === 1 ? 'property' : 'properties'} you're interested in`
                : `${getStoredInterested().length} ${getStoredInterested().length === 1 ? 'property' : 'properties'} you're interested in`}
            </p>
          </div>
          <Link to="/properties" className="btn btn-outline btn-sm">
            Browse Properties
          </Link>
        </div>

        {isAuthenticated ? (
          interested.length === 0 ? (
            <EmptyState
              message="You haven't marked any properties as interested yet."
              type="default"
              action={
                <Link to="/properties" className="btn btn-primary btn-sm">
                  Browse Properties
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {interested.map((item) => {
                const property = item.property || item;
                return (
                  <div
                    key={item.id || property.id}
                    className="card p-4 flex items-center gap-4"
                  >
                    <img
                      src={
                        property.primary_image
                          ? `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${property.primary_image}`
                          : 'https://placehold.co/120x90?text=No+Image'
                      }
                      alt={property.name}
                      className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text line-clamp-1">{property.name}</h3>
                      <p className="text-sm text-muted line-clamp-1">{property.location}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-primary">
                          {property.currency || 'KES'} {Number(property.price || 0).toLocaleString()}
                        </p>
                        <VatExcl />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/properties/${property.slug}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Property
                      </Link>
                      <button
                        onClick={() => handleRemoveLoggedIn(item.id)}
                        disabled={isLoadingRemove}
                        className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                        aria-label={`Remove ${property.name} from interested`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div>
            {getStoredInterested().length === 0 ? (
              <EmptyState
                message="You haven't added any properties to your interested list yet."
                type="default"
                action={
                  <Link to="/properties" className="btn btn-primary btn-sm">
                    Browse Properties
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {guestInterested.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard property={property} />
                    <button
                      onClick={() => handleRemoveGuest(property.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-error text-white p-1.5 rounded-lg hover:bg-error/90 transition-opacity"
                      aria-label={`Remove ${property.name} from interested`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-error">Failed to load interested properties. Please try again.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InterestedProperties;
