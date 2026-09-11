import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Plus,
} from 'lucide-react';
import { agentsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { extractList, extractTotal } from '@/utils';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  specialization: '',
  registration_number: '',
  license_number: '',
  license_expiry: '',
  status: 'active',
};

const AdminAgents = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings?.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Agents | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [searchTerm, statusFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.agents', queryParams],
    queryFn: () => agentsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editAgent ? agentsAPI.update(editAgent.id, payload) : agentsAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.agents'] });
      setShowFormModal(false);
      setEditAgent(null);
      setForm(EMPTY_FORM);
      setFormErrors({});
    },
    onError: (err) => setFormErrors(err.errors || { name: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => agentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.agents'] });
      setShowDeleteModal(false);
      setAgentToDelete(null);
    },
  });

  const agents = extractList(data);
  const total = extractTotal(data, agents.length);
  const totalPages = Math.ceil(total / limit);

  const isActive = (agent) =>
    agent?.is_active === true ||
    agent?.is_active === 1 ||
    agent?.status === 'active';

  const openCreate = () => {
    setEditAgent(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEdit = (agent) => {
    setEditAgent(agent);
    setForm({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      bio: agent.bio || '',
      specialization: agent.specialization || '',
      registration_number: agent.registration_number || '',
      license_number: agent.license_number || '',
      license_expiry: agent.license_expiry ? String(agent.license_expiry).slice(0, 10) : '',
      status: agent.status || (isActive(agent) ? 'active' : 'inactive'),
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Agents</h1>
          <p className="text-muted mt-1">Manage real estate agents and their profiles</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Agent
        </button>
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
        <EmptyState
          message="No agents found"
          type="search"
          action={
            <button type="button" onClick={openCreate} className="btn btn-primary">
              Add Agent
            </button>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-text">Agent</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Specialization</th>
                    <th className="text-left p-4 font-semibold text-text hidden lg:table-cell">License</th>
                    <th className="text-left p-4 font-semibold text-text">Status</th>
                    <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Rating</th>
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
                        {agent.license_number || 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={['px-2 py-1 rounded-full text-xs font-medium', isActive(agent) ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted'].join(' ')}>
                          {isActive(agent) ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {Number(agent.rating) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm text-text">
                            <Star className="w-4 h-4 text-warning fill-warning" />
                            {agent.rating}
                          </span>
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
                            onClick={() => openEdit(agent)}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-muted" />
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
                <p className="text-muted">{selectedAgent.specialization || 'Real Estate Agent'}</p>
                <span className={['inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium', isActive(selectedAgent) ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted'].join(' ')}>
                  {isActive(selectedAgent) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">Email</p>
                <p className="font-medium">{selectedAgent.email || '—'}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Phone</p>
                <p className="font-medium">{selectedAgent.phone || '—'}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">License</p>
                <p className="font-medium">{selectedAgent.license_number || 'N/A'}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Registration</p>
                <p className="font-medium">{selectedAgent.registration_number || 'N/A'}</p>
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

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={editAgent ? 'Edit Agent' : 'Add Agent'}
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="input w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                {formErrors.name && <p className="text-error text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {formErrors.email && <p className="text-error text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="input w-full"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <input
                  className="input w-full"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License number</label>
                <input
                  className="input w-full"
                  value={form.license_number}
                  onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License expiry</label>
                <input
                  type="date"
                  className="input w-full"
                  value={form.license_expiry}
                  onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration number</label>
                <input
                  className="input w-full"
                  value={form.registration_number}
                  onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="input w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="input w-full min-h-[100px]"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
                {saveMutation.isPending ? 'Saving...' : editAgent ? 'Update Agent' : 'Create Agent'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && agentToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Agent" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete <strong>{agentToDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => deleteMutation.mutate(agentToDelete.id)} disabled={deleteMutation.isPending} className="btn btn-error">
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
