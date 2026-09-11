import { getUploadBase } from '@/utils';
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

  const businessName = settings.business_name || 'Hemaprin Homes';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {interested.map((item) => {
                const property = item.property || item;
                return (
                  <div key={item.id || property.id} className="relative group">
                    <PropertyCard property={property} />
                    <button
                      onClick={() => handleRemoveLoggedIn(item.id)}
                      disabled={isLoadingRemove}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-error text-white p-1.5 rounded-lg hover:bg-error/90 transition-opacity z-20"
                      aria-label={`Remove ${property.name} from interested`}
                      title="Remove from interested"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
