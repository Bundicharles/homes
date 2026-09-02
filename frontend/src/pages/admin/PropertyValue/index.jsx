import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Save, Loader2, Sparkles, Check } from 'lucide-react';
import { featuresAPI } from '@/services/api';
import { Modal } from '@/components/Modal';

const CATEGORIES = ['Interior', 'Exterior', 'Utilities', 'Security', 'Community', 'Accessibility', 'Other'];
const EMPTY_FORM = { name: '', category: 'Interior', icon: '', description: '', is_active: true };

const PropertyValue = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin.features'],
    queryFn: () => featuresAPI.getAdmin(),
  });

  const allItems = data?.data || data?.features || [];
  const items = allItems.filter((f) => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const createMutation = useMutation({
    mutationFn: (payload) => featuresAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.features'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => setErrors(err.errors || { name: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => featuresAPI.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.features'] });
      setShowModal(false);
      setEditItem(null);
    },
    onError: (err) => setErrors(err.errors || { name: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => featuresAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.features'] });
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
      category: item.category || 'Interior',
      icon: item.icon || '',
      description: item.description || '',
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  const catColors = {
    Interior: 'bg-primary/10 text-primary',
    Exterior: 'bg-success/10 text-success',
    Utilities: 'bg-warning/10 text-warning',
    Security: 'bg-error/10 text-error',
    Community: 'bg-purple-100 text-purple-600',
    Accessibility: 'bg-blue-100 text-blue-600',
    Other: 'bg-muted/10 text-muted',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Features & Amenities</h1>
          <p className="text-sm text-muted mt-0.5">Manage property features, amenities, and attributes</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Feature</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input w-auto"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats by Category */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = allItems.filter((f) => f.category === cat).length;
          if (!count) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-smooth ${
                filterCat === cat ? 'border-primary bg-primary text-white' : `border-border ${catColors[cat]}`
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Feature</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Category</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
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
                      <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No features found. Add one to get started.</p>
                    </td>
                  </tr>
                )
              : items.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-hover/50 transition-smooth">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {f.icon && <span className="text-lg">{f.icon}</span>}
                        <span className="font-semibold text-text">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColors[f.category] || catColors.Other}`}>
                        {f.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-muted text-xs max-w-xs truncate">{f.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      {f.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-smooth">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeletingId(f.id); setShowDeleteModal(true); }}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Feature' : 'Add Feature'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input ${errors.name ? 'border-error' : ''}`}
                required
                placeholder="e.g. Swimming Pool"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
                required
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Icon (Emoji or CSS class)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="input"
              placeholder="🏊 or fa-swimming-pool"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              placeholder="Short description..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="checkbox"
            />
            <span className="text-sm font-medium text-text">Active (visible to agents/users)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isPending} className="btn btn-primary flex items-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editItem ? 'Save Changes' : 'Create Feature'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Feature">
        <div className="space-y-4">
          <p className="text-sm text-muted">Are you sure? This feature will be removed from all associated properties.</p>
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

export default PropertyValue;
