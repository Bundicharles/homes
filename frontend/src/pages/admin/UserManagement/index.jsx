import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  Loader2,
  Users,
  Shield,
  Check,
  X,
  ChevronDown,
  Key,
} from 'lucide-react';
import { usersAPI } from '@/services/api';
import { Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const ROLES = [
  { value: 'super-admin', label: 'Super Admin', color: 'bg-error/10 text-error' },
  { value: 'administrator', label: 'Administrator', color: 'bg-warning/10 text-warning' },
  { value: 'property-manager', label: 'Property Manager', color: 'bg-primary/10 text-primary' },
  { value: 'content-manager', label: 'Content Manager', color: 'bg-blue-100 text-blue-600' },
  { value: 'agent', label: 'Agent', color: 'bg-success/10 text-success' },
  { value: 'accountant', label: 'Accountant', color: 'bg-purple-100 text-purple-600' },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'agent',
  password: '',
  password_confirmation: '',
  is_active: true,
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.users', page, search, filterRole],
    queryFn: () => usersAPI.getAll({ page, search, role: filterRole, per_page: 20 }),
    keepPreviousData: true,
  });

  const users = data?.data || data?.users || [];
  const meta = data?.meta || {};

  const createMutation = useMutation({
    mutationFn: (payload) => usersAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.users'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => setErrors(err.errors || { email: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => usersAPI.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.users'] });
      setShowModal(false);
      setEditItem(null);
    },
    onError: (err) => setErrors(err.errors || { email: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.users'] });
      setShowDeleteModal(false);
      setDeletingItem(null);
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditItem(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'agent',
      password: '',
      password_confirmation: '',
      is_active: user.is_active !== false,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const payload = { ...form };
    if (editItem && !payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getRoleConfig = (role) => ROLES.find((r) => r.value === role) || ROLES[ROLES.length - 1];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-sm text-muted mt-0.5">Manage staff accounts, roles, and access permissions</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Staff User</span>
        </button>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRole('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-smooth ${
            !filterRole ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:text-text'
          }`}
        >
          All Roles
        </button>
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setFilterRole(filterRole === r.value ? '' : r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-smooth ${
              filterRole === r.value ? 'bg-primary text-white border-primary' : `border-border ${r.color}`
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">User</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Role</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-surface-hover rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : users.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No users found.</p>
                    </td>
                  </tr>
                )
              : users.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-surface-hover/50 transition-smooth">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text text-sm">{user.name}</p>
                            {user.phone && <p className="text-xs text-muted">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-muted">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-center">
                        {user.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                            <X className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted text-xs">
                        {getRelativeTime(user.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-smooth" title="Edit User">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeletingItem(user); setShowDeleteModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-smooth"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">Previous</button>
          <span className="text-sm text-muted">Page {page} of {meta.last_page}</span>
          <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="btn btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Staff User' : 'Add Staff User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input ${errors.email ? 'border-error' : ''}`}
                required
              />
              {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input"
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text flex items-center gap-2">
                <Key className="w-4 h-4" />
                {editItem ? 'Change Password (leave blank to keep current)' : 'Set Password *'}
              </h4>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-primary">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Password {!editItem && '*'}</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input ${errors.password ? 'border-error' : ''}`}
                  required={!editItem}
                  minLength={8}
                />
                {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Confirm Password {!editItem && '*'}</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  className="input"
                  required={!editItem}
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="checkbox"
            />
            <span className="text-sm font-medium text-text">Active (can log in to admin)</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isPending} className="btn btn-primary flex items-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editItem ? 'Save Changes' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Staff User">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete the account for{' '}
            <strong>{deletingItem?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Cancel</button>
            <button
              onClick={() => deleteMutation.mutate(deletingItem.id)}
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

export default UserManagement;
