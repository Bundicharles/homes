import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  MessageCircle,
  Calendar,
  Bell,
  ArrowRight,
} from 'lucide-react';
import {
  favoritesAPI,
  interestedAPI,
  inquiriesAPI,
  viewingAPI,
  notificationsAPI,
} from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';
import VatExcl from '@/components/VatExcl';
import { formatPrice, getRelativeTime, getUploadBase } from '@/utils';

const CustomerDashboard = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const businessName = settings.business_name || 'Hemaprin Homes';

  useEffect(() => {
    document.title = `Dashboard | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'View your saved properties, inquiries, viewings, and notifications in your customer dashboard.'
      );
    }
  }, [businessName]);

  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getAll(),
    enabled: !!user,
    retry: false,
  });

  const { data: interestedData, isLoading: interestedLoading } = useQuery({
    queryKey: ['interested'],
    queryFn: () => interestedAPI.getAll(),
    enabled: !!user,
    retry: false,
  });

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['customer-inquiries'],
    queryFn: () => inquiriesAPI.getMine(),
    enabled: !!user,
    retry: false,
  });

  const { data: viewingsData, isLoading: viewingsLoading } = useQuery({
    queryKey: ['customer-viewings'],
    queryFn: () => viewingAPI.getMine(),
    enabled: !!user,
    retry: false,
  });

  const favorites = favData?.success ? (favData.data.data || favData.data) : [];
  const interestedItems = interestedData?.success ? (interestedData.data.data || interestedData.data) : [];
  const inquiries = inquiriesData?.success ? (inquiriesData.data.data || inquiriesData.data) : [];
  const viewings = viewingsData?.success ? (viewingsData.data.data || viewingsData.data) : [];

  const isLoading = favLoading || interestedLoading || inquiriesLoading || viewingsLoading;

  const statCards = [
    {
      name: 'My Favorites',
      value: favorites.length,
      icon: Heart,
      to: '/dashboard/favorites',
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      name: 'My Interested',
      value: interestedItems.length,
      icon: ShoppingCart,
      to: '/dashboard/interested',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      name: 'My Inquiries',
      value: inquiries.length,
      icon: MessageCircle,
      to: '/dashboard/inquiries',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      name: 'My Viewings',
      value: viewings.length,
      icon: Calendar,
      to: '/dashboard/viewings',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      name: 'Unread Notifications',
      value: unreadCount,
      icon: Bell,
      to: '/dashboard/notifications',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  const recentFavorites = favorites.slice(0, 3);
  const recentInquiries = inquiries.slice(0, 3);

  const getPropertyImage = (property) => {
    return property?.primary_image
      ? `${getUploadBase()}uploads/properties/${property.primary_image}`
      : 'https://placehold.co/80x60?text=No+Image';
  };

  const getInquiriesStatusCounts = () => {
    const counts = { pending: 0, responded: 0, closed: 0 };
    inquiries.forEach((inq) => {
      if (counts[inq.status] !== undefined) {
        counts[inq.status]++;
      } else if (inq.status) {
        counts[inq.status.toLowerCase()] = (counts[inq.status.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  };

  const statusCounts = getInquiriesStatusCounts();

  const getInProgressViewings = () => {
    return viewings.filter(
      (v) => v.status !== 'completed' && v.status !== 'cancelled'
    ).length;
  };

  const inProgressViewings = getInProgressViewings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted/20 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          Dashboard Overview
        </h1>
        <p className="text-muted mt-1">
          Track your saved properties, inquiries, and viewings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              to={card.to}
              className="card p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={['w-12 h-12 rounded-lg flex items-center justify-center', card.bg].join(' ')}>
                  <Icon className={['w-6 h-6', card.color].join(' ')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted truncate">{card.name}</p>
                  <p className="text-2xl font-bold text-text">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Inquiry Status</h2>
            <Link
              to="/dashboard/inquiries"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
              <span className="text-sm text-text">Pending</span>
              <span className="font-semibold text-warning">{statusCounts.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
              <span className="text-sm text-text">Responded</span>
              <span className="font-semibold text-primary">{statusCounts.responded}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
              <span className="text-sm text-text">Closed</span>
              <span className="font-semibold text-muted">{statusCounts.closed}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Upcoming Viewings</h2>
            <Link
              to="/dashboard/viewings"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {inProgressViewings > 0 ? (
            <div className="space-y-3">
              {viewings
                .filter((v) => v.status !== 'completed' && v.status !== 'cancelled')
                .slice(0, 3)
                .map((viewing) => (
                  <div
                    key={viewing.id}
                    className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg"
                  >
                    <Calendar className="w-5 h-5 text-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">
                        {viewing.property?.name || 'Property viewing'}
                      </p>
                      <p className="text-sm text-muted">
                        {viewing.scheduled_at
                          ? new Date(viewing.scheduled_at).toLocaleDateString()
                          : 'Date not set'}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        viewing.status === 'approved'
                          ? 'bg-success/10 text-success'
                          : viewing.status === 'rejected'
                          ? 'bg-error/10 text-error'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {viewing.status}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              message="No upcoming viewings scheduled."
              type="default"
              action={
                <Link to="/properties" className="btn btn-primary btn-sm">
                  Browse Properties
                </Link>
              }
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Favorites</h2>
            <Link
              to="/dashboard/favorites"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentFavorites.length === 0 ? (
            <EmptyState
              message="No favorites yet."
              type="favorite"
              action={
                <Link to="/properties" className="btn btn-primary btn-sm">
                  Browse Properties
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentFavorites.map((fav) => {
                const property = fav.property || fav;
                return (
                  <Link
                    key={fav.id || property.id}
                    to={`/properties/${property.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={getPropertyImage(property)}
                      alt={property.name}
                      className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text group-hover:text-primary transition-smooth truncate">
                        {property.name}
                      </h3>
                      <p className="text-sm text-muted line-clamp-1">
                        {property.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-primary">
                        {formatPrice(property.price, property.currency)}
                      </div>
                      <VatExcl className="mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Inquiries</h2>
            <Link
              to="/dashboard/inquiries"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <EmptyState
              message="No recent inquiries."
              type="default"
            />
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg"
                >
                  <MessageCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">
                      {inq.subject || 'Inquiry about property'}
                    </p>
                    <p className="text-sm text-muted">
                      {getRelativeTime(inq.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      inq.status === 'pending'
                        ? 'bg-warning/10 text-warning'
                        : inq.status === 'responded'
                        ? 'bg-success/10 text-success'
                        : inq.status === 'closed'
                        ? 'bg-muted/10 text-muted'
                        : 'bg-muted/10 text-muted'
                    }`}
                  >
                    {inq.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
