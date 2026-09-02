import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Trash2,
  Loader2,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { customersAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, Modal } from '@/components/Modal';
import VatExcl from '@/components/VatExcl';
import { formatPrice, getRelativeTime } from '@/utils';

const CustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    email_verified: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin.customer', id],
    queryFn: () => customersAPI.getById(id),
    enabled: !!id,
  });

  const customer = data?.success ? data.data : null;

  useEffect(() => {
    if (customer) {
      document.title = `${customer.name} | ${businessName} Admin`;
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: customer.status || 'active',
        email_verified: !!customer.email_verified,
      });
    }
  }, [customer, businessName]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => customersAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.customer', id] });
      queryClient.invalidateQueries({ queryKey: ['admin.customers'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => customersAPI.delete ? customersAPI.delete(id) : fetch(`/homes/backend/api/admin/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.customers'] });
      navigate('/admin/customers');
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center bg-surface rounded-2xl border border-border">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Customer Not Found</h2>
        <p className="text-muted mb-6">The customer account could not be loaded or has been removed.</p>
        <Link to="/admin/customers" className="btn btn-primary">
          Back to Customers
        </Link>
      </div>
    );
  }

  const inquiries = customer.inquiries || [];
  const viewings = customer.viewings || [];
  const favorites = customer.favorites || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">{customer.name}</h1>
            <p className="text-sm text-muted">Customer Account #{customer.id} • Registered {getRelativeTime(customer.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              customer.status === 'active'
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
          >
            {customer.status?.toUpperCase() || 'ACTIVE'}
          </span>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl border border-border hover:border-error text-muted hover:text-error transition-smooth"
            title="Delete Customer Account"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{inquiries.length}</div>
            <div className="text-xs text-muted">Total Inquiries</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{viewings.length}</div>
            <div className="text-xs text-muted">Viewing Requests</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10 text-warning">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text">{favorites.length}</div>
            <div className="text-xs text-muted">Saved Favorites</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Account</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === 'inquiries'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('viewings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === 'viewings'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Viewings ({viewings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
            activeTab === 'favorites'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites ({favorites.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROFILE FORM */}
      {activeTab === 'overview' && (
        <form onSubmit={handleUpdateProfile} className="card p-6 space-y-6">
          <h3 className="text-base font-bold text-text">Customer Information & Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.email_verified}
                  onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                  className="checkbox"
                />
                <span className="text-sm font-medium text-text">Mark Email as Verified</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Customer Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="card p-8 text-center text-muted">No inquiries submitted by this customer.</div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-sm">{inq.subject || 'Property Inquiry'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {inq.status}
                    </span>
                  </div>
                  {inq.property_name && (
                    <p className="text-xs text-muted mt-1">Property: <strong>{inq.property_name}</strong></p>
                  )}
                  <p className="text-xs text-text mt-2 line-clamp-2">{inq.message}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{getRelativeTime(inq.created_at)}</span>
                  <Link to={`/admin/messages/${inq.id}`} className="btn btn-outline btn-sm">
                    View Thread
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: VIEWINGS */}
      {activeTab === 'viewings' && (
        <div className="space-y-4">
          {viewings.length === 0 ? (
            <div className="card p-8 text-center text-muted">No viewing requests submitted by this customer.</div>
          ) : (
            viewings.map((vr) => (
              <div key={vr.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-sm">{vr.property_name || 'Property Viewing'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                      {vr.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-3 mt-1.5">
                    <span>Preferred Date: <strong>{vr.preferred_date || 'Flexible'}</strong></span>
                    {vr.agent_name && <span>Agent: <strong>{vr.agent_name}</strong></span>}
                  </div>
                </div>
                <span className="text-xs text-muted">{getRelativeTime(vr.created_at)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-muted">No properties saved to favorites.</div>
          ) : (
            favorites.map((fav) => (
              <div key={fav.id || fav.favorite_id} className="card overflow-hidden group">
                <div className="aspect-[16/10] bg-muted/20 relative">
                  <img
                    src={fav.primary_image ? `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${fav.primary_image}` : 'https://placehold.co/400x250?text=No+Image'}
                    alt={fav.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-semibold text-text text-sm line-clamp-1">{fav.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-primary font-bold">{formatPrice(fav.price, fav.currency || 'KES')}</p>
                    <VatExcl />
                  </div>
                  <p className="text-xs text-muted truncate">{fav.location}, {fav.county}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to permanently delete the customer account for <strong>{customer.name}</strong>? All their inquiries, viewings, and saved properties will be removed.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="btn bg-error text-white hover:bg-error/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerView;
