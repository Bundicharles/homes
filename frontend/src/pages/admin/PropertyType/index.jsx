import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Loader2,
  Home,
  Check,
} from 'lucide-react';
import { propertyTypesAPI } from '@/services/api';
import { Modal } from '@/components/Modal';

const EMPTY_FORM = { name: '', slug: '', description: '', icon: '', is_active: true };

const PropertyType = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin.property-types'],
    queryFn: () => propertyTypesAPI.getAdmin(),
  });

  const items = (data?.data || data?.property_types || []).filter((pt) =>
    !search || pt.name?.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (payload) => propertyTypesAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.property-types'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => setErrors(err.errors || { name: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => propertyTypesAPI.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.property-types'] });
      setShowModal(false);
      setEditItem(null);
    },
    onError: (err) => setErrors(err.errors || { name: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyTypesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.property-types'] });
      setShowDeleteModal(false);
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      icon: item.icon || '',
      is_active: item.is_active !== false,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Property Types</h1>
          <p className="text-sm text-muted mt-0.5">Manage property categories (Apartment, Villa, Land, etc.)</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Property Type</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search property types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Slug</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted uppercase tracking-wide">Active</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 bg-surface-hover rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : items.length === 0
              ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      <Home className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No property types found. Create one above.</p>
                    </td>
                  </tr>
                )
              : items.map((pt) => (
                  <tr key={pt.id} className="hover:bg-surface-hover/50 transition-smooth">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {pt.icon && <span className="text-lg">{pt.icon}</span>}
                        <span className="font-semibold text-text">{pt.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-muted">{pt.slug}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-muted text-xs max-w-xs truncate">{pt.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      {pt.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(pt)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-smooth">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeletingId(pt.id); setShowDeleteModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-smooth"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Property Type' : 'Add Property Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: autoSlug(name) });
                }}
                className={`input ${errors.name ? 'border-error' : ''}`}
                required
                placeholder="e.g. Apartment"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input"
                placeholder="auto-generated"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Icon (Emoji or CSS class)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="input"
              placeholder="🏠 or fa-home"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="Brief description of this property type..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="checkbox"
            />
            <span className="text-sm font-medium text-text">Active (visible to users)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isPending} className="btn btn-primary flex items-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editItem ? 'Save Changes' : 'Create Type'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Property Type">
        <div className="space-y-4">
          <p className="text-sm text-muted">Are you sure? Properties using this type may be affected.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Cancel</button>
            <button
              onClick={() => deleteMutation.mutate(deletingId)}
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

export default PropertyType;
