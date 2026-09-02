import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { agentsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { formatNumber, getRelativeTime } from '@/utils';

const AdminAgents = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Agents | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 1 : 0;
    return params;
  }, [searchTerm, statusFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.agents', queryParams],
    queryFn: () => agentsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => agentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.agents'] });
      setShowDeleteModal(false);
      setAgentToDelete(null);
    },
  });

  const agents = data?.success ? data.data.data || data.data : [];
  const totalPages = data?.success ? Math.ceil((data.data.total || 0) / limit) : 0;
  const total = data?.success ? (data.data.total || 0) : 0;

  const handleDelete = () => {
    if (agentToDelete) {
      deleteMutation.mutate(agentToDelete.id);
    }
  };

  const getActiveBadge = (isActive) => {
    return isActive
      ? 'bg-success/10 text-success'
      : 'bg-muted/20 text-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Agents</h1>
          <p className="text-muted mt-1">Manage real estate agents and their profiles</p>
        </div>
        <Link to="/admin/agents/add" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Agent
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search agents by name, email, or phone..."
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
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load agents</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : agents.length === 0 ? (
        <EmptyState message="No agents found" type="search" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-text">Agent</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Specialization</th>
                    <th className="text-left p-4 font-semibold text-text hidden lg:table-cell">Experience</th>
                    <th className="text-left p-4 font-semibold text-text">Status</th>
                    <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Featured</th>
                    <th className="text-right p-4 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {agent.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-text">{agent.name}</p>
                            <p className="text-sm text-muted">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted">
                        {agent.specialization || 'General'}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted">
                        {agent.experience_years ? `${agent.experience_years} years` : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={['px-2 py-1 rounded-full text-xs font-medium', getActiveBadge(agent.is_active)].join(' ')}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {agent.is_featured ? (
                          <Star className="w-4 h-4 text-warning fill-warning" />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedAgent(agent); setShowViewModal(true); }}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => { setAgentToDelete(agent); setShowDeleteModal(true); }}
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-error" />
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

      {showViewModal && selectedAgent && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Agent Details" maxWidth="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {selectedAgent.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{selectedAgent.name}</h3>
                <p className="text-muted">{selectedAgent.title || 'Real Estate Agent'}</p>
                <span className={['inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium', getActiveBadge(selectedAgent.is_active)].join(' ')}>
                  {selectedAgent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">Email</p>
                <p className="font-medium">{selectedAgent.email}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Phone</p>
                <p className="font-medium">{selectedAgent.phone}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Specialization</p>
                <p className="font-medium">{selectedAgent.specialization || 'General'}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Experience</p>
                <p className="font-medium">{selectedAgent.experience_years ? `${selectedAgent.experience_years} years` : 'N/A'}</p>
              </div>
            </div>

            {selectedAgent.bio && (
              <div className="card p-4">
                <p className="text-sm text-muted mb-2">Bio</p>
                <p className="text-text">{selectedAgent.bio}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && agentToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Agent" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete <strong>{agentToDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending} className="btn btn-error">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminAgents;
