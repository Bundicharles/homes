import { getUploadBase } from '@/utils';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertiesAPI, favoritesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import PropertyCard from '@/components/PropertyCard';
import VatExcl from '@/components/VatExcl';
import { EmptyState, LoadingSkeleton } from '@/components/Modal';
import {
  getStoredFavorites,
  setStoredFavorites,
  getStoredInterested,
  setStoredInterested,
} from '@/utils/authStorage';
import { Heart, Trash2 } from 'lucide-react';

const Favorites = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const businessName = settings.business_name || 'Hemaprin Homes';

  useEffect(() => {
    document.title = `My Favorites | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'View and manage your favorite properties. Save properties to easily compare and revisit them later.');
    }
  }, [businessName]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getAll(),
    enabled: isAuthenticated,
  });

  const favorites = data?.success ? (data.data.data || data.data) : [];
  const favoritedPropertyIds = favorites?.map((f) => f.property?.id || f.property_id) || [];

  const removeMutation = useMutation({
    mutationFn: (id) => favoritesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleRemoveLoggedIn = (id) => {
    removeMutation.mutate(id);
  };

  const handleRemoveGuest = (propertyId) => {
    const favs = getStoredFavorites();
    const newFavs = favs.filter((id) => id !== propertyId);
    setStoredFavorites(newFavs);
    queryClient.invalidateQueries({ queryKey: ['guest-favorites'] });
  };

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['guest-favorites-properties'],
    queryFn: () => propertiesAPI.getAll({ ids: getStoredFavorites().join(',') }),
    enabled: !isAuthenticated && getStoredFavorites().length > 0,
  });

  const guestFavorites = propertiesData?.success
    ? (propertiesData.data.data || propertiesData.data)
    : [];

  const isLoadingRemove = removeMutation.isPending;

  if (isLoading || propertiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text mb-6">My Favorites</h1>
        <LoadingSkeleton count={8} type="property-card" />
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text">My Favorites</h1>
            <p className="text-muted mt-1">
              {isAuthenticated
                ? `${favorites.length} saved ${favorites.length === 1 ? 'property' : 'properties'}`
                : `${getStoredFavorites().length} saved ${getStoredFavorites().length === 1 ? 'property' : 'properties'}`}
            </p>
          </div>
          <Link to="/properties" className="btn btn-outline btn-sm">
            Browse Properties
          </Link>
        </div>

        {isAuthenticated ? (
          favorites.length === 0 ? (
            <EmptyState
              message="You haven't saved any favorite properties yet."
              type="favorite"
              action={
                <Link to="/properties" className="btn btn-primary btn-sm">
                  Browse Properties
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => {
                const property = {
                  ...(favorite.property || favorite),
                  favorite_id: favorite.id,
                  is_favorited: true,
                };
                return (
                  <div key={favorite.id || property.id} className="relative group">
                    <PropertyCard property={property} />
                    <button
                      onClick={() => handleRemoveLoggedIn(favorite.id)}
                      disabled={isLoadingRemove}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-error text-white p-1.5 rounded-lg hover:bg-error/90 transition-opacity z-20"
                      aria-label={`Remove ${property.name} from favorites`}
                      title="Remove from favorites"
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
            {getStoredFavorites().length === 0 ? (
              <EmptyState
                message="You haven't saved any favorite properties yet."
                type="favorite"
                action={
                  <Link to="/properties" className="btn btn-primary btn-sm">
                    Browse Properties
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {guestFavorites.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard property={property} />
                    <button
                      onClick={() => handleRemoveGuest(property.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-error text-white p-1.5 rounded-lg hover:bg-error/90 transition-opacity"
                      aria-label={`Remove ${property.name} from favorites`}
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
            <p className="text-error">Failed to load favorites. Please try again.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;
