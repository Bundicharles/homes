import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { adminViewingsAPI, agentsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'];

const ViewingRequests = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewingToDelete, setViewingToDelete] = useState(null);

  // Edit form in modal
  const [editStatus, setEditStatus] = useState('');
  const [editAgent, setEditAgent] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const limit = 15;

  useEffect(() => {
    document.title = `Viewing Requests | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (agentFilter !== 'all') params.agent_id = agentFilter;
    return params;
  }, [searchTerm, statusFilter, agentFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.viewings', queryParams],
    queryFn: () => adminViewingsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const { data: agentsData } = useQuery({
    queryKey: ['admin.agents'],
    queryFn: () => agentsAPI.getAll(),
  });

  const agents = agentsData?.success ? (agentsData.data.data || agentsData.data) : [];

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminViewingsAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.viewings'] });
      queryClient.invalidateQueries({ queryKey: ['admin.dashboard'] });
      setShowDetailModal(false);
      setSelectedViewing(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminViewingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.viewings'] });
      setShowDeleteModal(false);
      setViewingToDelete(null);
    },
  });

  const viewings = data?.success ? (data.data.data || data.data) : [];
  const total = data?.success ? (data.data.total ?? data.data.pagination?.total ?? 0) : 0;
  const totalPages = Math.ceil(total / limit);

  const handleOpenDetail = (viewing) => {
    setSelectedViewing(viewing);
    setEditStatus(viewing.status || 'Pending');
    setEditAgent(viewing.assigned_agent || '');
    setEditNotes(viewing.admin_notes || viewing.agent_notes || '');
    setShowDetailModal(true);
  };

  const handleSaveDetail = () => {
    if (!selectedViewing) return;
    updateMutation.mutate({
      id: selectedViewing.id,
      payload: {
        status: editStatus,
        assigned_agent: editAgent ? Number(editAgent) : null,
        agent_notes: editNotes,
      },
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      confirmed: 'bg-success/10 text-success border-success/20',
      rescheduled: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-info/10 text-info border-info/20',
      cancelled: 'bg-error/10 text-error border-error/20',
    };
    const key = (status || '').toLowerCase();
    const style = map[key] || 'bg-muted/10 text-muted border-border';
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style}`}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Viewing Requests</h1>
          <p className="text-sm text-muted">
            Manage customer property tour and site viewing appointments
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Total Requests: <strong>{total}</strong></span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or property..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input w-auto"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st.toLowerCase()}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input w-auto"
          >
            <option value="all">All Agents</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingSkeleton count={6} type="card" />
      ) : viewings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No viewing requests found"
          description="There are currently no viewing requests matching your criteria."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-hover text-muted uppercase text-xs border-b border-border">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Property</th>
                  <th className="py-3.5 px-4 font-semibold">Preferred Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Agent</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {viewings.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-text">{req.customer_name || req.name}</div>
                      <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        <span>{req.customer_email || req.email}</span>
                        <span>•</span>
                        <span>{req.customer_phone || req.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-text line-clamp-1">
                        {req.property_name || 'General Property Inquiry'}
                      </div>
                      {req.property_location && (
                        <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{req.property_location}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-text flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{req.preferred_date ? new Date(req.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}</span>
                      </div>
                      {(req.preferred_time_start || req.preferred_time_end) && (
                        <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {req.preferred_time_start || '09:00'} - {req.preferred_time_end || '17:00'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {req.agent_name ? (
                        <span className="text-xs font-medium text-text bg-surface px-2.5 py-1 rounded-full border border-border">
                          {req.agent_name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(req.status)}</td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(req)}
                          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-smooth"
                          title="View / Manage Request"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setViewingToDelete(req);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-smooth"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}

      {/* DETAIL / UPDATE MODAL */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedViewing(null);
        }}
        title="Viewing Request Details"
      >
        {selectedViewing && (
          <div className="space-y-5">
            {/* Customer info card */}
            <div className="p-4 rounded-xl bg-surface-hover/60 border border-border space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-xs text-muted">Name</span>
                  <p className="text-sm font-semibold text-text">
                    {selectedViewing.customer_name || selectedViewing.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted">Email</span>
                  <p className="text-sm font-semibold text-text truncate">
                    {selectedViewing.customer_email || selectedViewing.email}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted">Phone</span>
                  <p className="text-sm font-semibold text-text">
                    {selectedViewing.customer_phone || selectedViewing.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Property info */}
            {selectedViewing.property_name && (
              <div className="p-4 rounded-xl bg-surface-hover/60 border border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Target Property</h4>
                <p className="text-sm font-semibold text-text">{selectedViewing.property_name}</p>
                <p className="text-xs text-muted">{selectedViewing.property_location}</p>
              </div>
            )}

            {/* Customer Message */}
            {selectedViewing.message && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Customer Message / Notes
                </label>
                <div className="p-3 rounded-xl bg-background border border-border text-sm text-text">
                  {selectedViewing.message}
                </div>
              </div>
            )}

            {/* Status & Agent Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Appointment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="input"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Assigned Agent</label>
                <select
                  value={editAgent}
                  onChange={(e) => setEditAgent(e.target.value)}
                  className="input"
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Internal Admin Notes</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes for agent, client availability remarks..."
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveDetail}
                disabled={updateMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{updateMutation.isPending ? 'Saving...' : 'Save Updates'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Viewing Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete the viewing request for{' '}
            <strong>{viewingToDelete?.customer_name || viewingToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate(viewingToDelete.id)}
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

export default ViewingRequests;
