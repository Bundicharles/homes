import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-react';
import { customersAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { formatNumber, getRelativeTime } from '@/utils';

const AdminCustomers = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusUpdateId, setStatusUpdateId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const limit = 15;

  useEffect(() => {
    document.title = `Customers | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [searchTerm, statusFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.customers', queryParams],
    queryFn: () => customersAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => customersAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.customers'] });
      setShowViewModal(false);
      setStatusUpdateId(null);
    },
  });

  const customers = data?.success ? data.data.data || data.data : [];
  const totalPages = data?.success ? Math.ceil((data.data.total || 0) / limit) : 0;
  const total = data?.success ? (data.data.total || 0) : 0;

  const handleStatusUpdate = () => {
    if (statusUpdateId && newStatus) {
      statusMutation.mutate({ id: statusUpdateId, status: newStatus });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted/20 text-muted',
      pending: 'bg-warning/10 text-warning',
      suspended: 'bg-error/10 text-error',
    };
    return styles[status] || 'bg-muted/20 text-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Customers</h1>
          <p className="text-muted mt-1">Manage registered customers and their activity</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load customers</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState message="No customers found" type="search" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-text">Customer</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Contact</th>
                    <th className="text-left p-4 font-semibold text-text hidden lg:table-cell">Activity</th>
                    <th className="text-left p-4 font-semibold text-text">Status</th>
                    <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Joined</th>
                    <th className="text-right p-4 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-text">{customer.name}</p>
                            <p className="text-sm text-muted">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-muted">{customer.phone || 'Not provided'}</p>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {customer.favorite_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {customer.inquiry_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {customer.viewing_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={['px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(customer.status)].join(' ')}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-sm text-muted">
                        {getRelativeTime(customer.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedCustomer(customer); setShowViewModal(true); }}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-muted" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      {showViewModal && selectedCustomer && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Customer Details" maxWidth="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {selectedCustomer.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{selectedCustomer.name}</h3>
                <p className="text-muted">{selectedCustomer.email}</p>
                <span className={['inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(selectedCustomer.status)].join(' ')}>
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">Phone</p>
                <p className="font-medium">{selectedCustomer.phone || 'Not provided'}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Member Since</p>
                <p className="font-medium">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Favorites</p>
                <p className="font-medium">{selectedCustomer.favorite_count || 0}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Inquiries</p>
                <p className="font-medium">{selectedCustomer.inquiry_count || 0}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Update Status</label>
              <div className="flex gap-2">
                <select
                  value={newStatus || selectedCustomer.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input flex-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={statusMutation.isPending || newStatus === selectedCustomer.status}
                  className="btn btn-primary"
                >
                  {statusMutation.isPending ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminCustomers;
