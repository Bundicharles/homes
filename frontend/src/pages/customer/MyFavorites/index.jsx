import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';
import VatExcl from '@/components/VatExcl';
import { formatPrice, getRelativeTime, getUploadBase } from '@/utils';

const MyFavorites = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const businessName = settings.business_name || 'Hemaprin Homes';

  useEffect(() => {
    document.title = `My Favorites | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'View and manage your favorite properties. Remove properties from your favorites list at any time.'
      );
    }
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getAll(),
    enabled: !!user,
    retry: false,
  });

  const favorites = data?.success ? (data.data.data || data.data) : [];

  const removeMutation = useMutation({
    mutationFn: (id) => favoritesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['customer.favorites'] });
    },
    onError: () => {},
  });

  const handleRemove = (id) => {
    removeMutation.mutate(id);
  };

  const getPropertyImage = (property) => {
    return property?.primary_image
      ? `${getUploadBase()}uploads/properties/${property.primary_image}`
      : 'https://placehold.co/120x90?text=No+Image';
  };

  const getStatusClass = (status) => {
    const base = 'text-xs font-medium px-2 py-1 rounded';
    switch (status) {
      case 'Available':
        return `${base} bg-success/10 text-success`;
      case 'Reserved':
        return `${base} bg-warning/10 text-warning`;
      case 'Sold':
        return `${base} bg-error/10 text-error`;
      case 'Under Offer':
        return `${base} bg-orange-100 text-orange-800`;
      default:
        return `${base} bg-muted/10 text-muted`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text mb-6">My Favorites</h1>
        <LoadingSkeleton count={4} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">
          Failed to load favorites. Please try again.
        </p>
        <button
          onClick={() => refetchFavorites()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            My Favorites
          </h1>
          <p className="text-muted mt-1">
            {favorites.length}{' '}
            {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        <Link
          to="/properties"
          className="btn btn-outline btn-sm w-full sm:w-auto"
        >
          Browse More Properties
        </Link>
      </div>

      {favorites.length === 0 ? (
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
        <div className="space-y-4">
          {favorites.map((favorite) => {
            const property = favorite.property || favorite;
            const favoriteId = favorite.id;
            return (
              <div
                key={favoriteId || property.id}
                className="card p-4 flex items-center gap-4"
              >
                <img
                  src={getPropertyImage(property)}
                  alt={property.name}
                  className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text line-clamp-1">
                      {property.name}
                    </h3>
                    <span className={getStatusClass(property.status)}>
                      {property.status || 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-muted line-clamp-1 mt-1">
                    {property.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-bold text-primary">
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <VatExcl />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Saved {getRelativeTime(favorite.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/properties/${property.slug}`}
                    className="btn btn-outline btn-sm"
                    aria-label={`View ${property.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleRemove(favoriteId)}
                    disabled={removeMutation.isPending}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                    aria-label={`Remove ${property.name} from favorites`}
                  >
                    {removeMutation.isPending &&
                    removeMutation.variables === favoriteId ? (
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 80-8v4a8 8 0 008 8z"
                        />
                      </svg>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
