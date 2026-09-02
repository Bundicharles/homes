import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { viewingAPI, adminViewingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { LoadingSkeleton, EmptyState, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const MyViewings = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState(null);

  useEffect(() => {
    document.title = `My Viewings | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'View and track all your property viewing requests, including scheduled dates and statuses.'
      );
    }
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch: refetchViewings,
  } = useQuery({
    queryKey: ['customer-viewings'],
    queryFn: () => viewingAPI.submit(),
    enabled: !!user,
    retry: false,
  });

  const viewings = data?.success ? (data.data.data || data.data) : [];

  const handleViewDetails = (viewing) => {
    setSelectedViewing(viewing);
    setDetailModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-error" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-muted" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusClass = (status) => {
    const base =
      'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full';
    switch (status) {
      case 'approved':
        return `${base} bg-success/10 text-success`;
      case 'rejected':
        return `${base} bg-error/10 text-error`;
      case 'cancelled':
        return `${base} bg-muted/10 text-muted`;
      default:
        return `${base} bg-warning/10 text-warning`;
    }
  };

  const pendingViewings = viewings.filter(
    (v) => v.status === 'pending' || v.status === 'scheduled'
  );
  const approvedViewings = viewings.filter((v) => v.status === 'approved');
  const rejectedViewings = viewings.filter(
    (v) => v.status === 'rejected' || v.status === 'cancelled'
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text mb-6">My Viewings</h1>
        <LoadingSkeleton count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">
          Failed to load viewing requests. Please try again.
        </p>
        <button onClick={() => refetchViewings()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const getStatusBadge = (viewing) => (
    <span className={getStatusClass(viewing.status)}>
      {getStatusIcon(viewing.status)}
      <span className="capitalize">
        {viewing.status === 'scheduled' ? 'pending' : viewing.status}
      </span>
    </span>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            My Viewings
          </h1>
          <p className="text-muted mt-1">
            {viewings.length}{' '}
            {viewings.length === 1 ? 'request' : 'requests'} total
          </p>
        </div>
      </div>

      {viewings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-warning">{pendingViewings.length}</div>
            <p className="text-sm text-muted">Pending</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-success">{approvedViewings.length}</div>
            <p className="text-sm text-muted">Approved</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-muted">{rejectedViewings.length}</div>
            <p className="text-sm text-muted">Rejected/Cancelled</p>
          </div>
        </div>
      )}

      {viewings.length === 0 ? (
        <EmptyState
          message="You haven't requested any property viewings yet."
          type="default"
          action={
            <Link to="/properties" className="btn btn-primary btn-sm">
              Browse Properties
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {viewings.map((viewing) => (
            <div
              key={viewing.id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text line-clamp-1">
                    {viewing.property?.name || 'Property viewing'}
                  </h3>
                  <p className="text-sm text-muted line-clamp-1">
                    {viewing.property?.location || 'Location not available'}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <div className="flex items-center gap-1 text-muted">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(viewing.created_at)}
                    </div>
                    <div className="text-muted">
                      Scheduled: {formatDate(viewing.scheduled_at)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(viewing)}
                <button
                  onClick={() => handleViewDetails(viewing)}
                  className="btn btn-ghost btn-sm"
                  aria-label={`View details for viewing #${viewing.id}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedViewing(null);
        }}
        title={`Viewing Request #${selectedViewing?.id}`}
        maxWidth="lg"
      >
        {selectedViewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-text mb-1">Property</h3>
                <Link
                  to={`/properties/${selectedViewing.property?.slug}`}
                  className="text-primary hover:text-primary-hover font-medium"
                >
                  {selectedViewing.property?.name || 'N/A'}
                </Link>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Status</h3>
                <span className={getStatusClass(selectedViewing.status)}>
                  {getStatusIcon(selectedViewing.status)}
                  <span className="capitalize">{selectedViewing.status}</span>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">
                  Scheduled Date
                </h3>
                <p className="text-text">
                  {formatDate(selectedViewing.scheduled_at)}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">
                  Requested On
                </h3>
                <p className="text-muted">
                  {new Date(selectedViewing.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedViewing.message && (
              <div>
                <h3 className="font-semibold text-text mb-1">Your Message</h3>
                <p className="text-muted whitespace-pre-wrap">
                  {selectedViewing.message}
                </p>
              </div>
            )}

            {selectedViewing.notes && (
              <div>
                <h3 className="font-semibold text-text mb-1">Admin Notes</h3>
                <p className="text-muted whitespace-pre-wrap">
                  {selectedViewing.notes}
                </p>
              </div>
            )}

            {selectedViewing.property && (
              <div>
                <h3 className="font-semibold text-text mb-2">Property Details</h3>
                <img
                  src={
                    selectedViewing.property.primary_image
                      ? `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${selectedViewing.property.primary_image}`
                      : 'https://placehold.co/400x250?text=No+Image'
                  }
                  alt={selectedViewing.property.name}
                  className="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
                <p className="text-sm text-muted mt-2 line-clamp-1">
                  {selectedViewing.property.location}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyViewings;
