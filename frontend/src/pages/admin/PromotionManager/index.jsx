import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Target,
  Clock,
  AlertCircle,
  Search,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { adminPromotionsAPI, mediaAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { getUploadBase, resolveAssetUrl } from '@/utils';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';

const AdminPromotionManager = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `Promotions | ${businessName} Admin`;
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.promotions'],
    queryFn: () => adminPromotionsAPI.getAll(),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (promoData) => adminPromotionsAPI.create(promoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.promotions'] });
      setShowModal(false);
      setEditingPromotion(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminPromotionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.promotions'] });
      setShowModal(false);
      setEditingPromotion(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminPromotionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.promotions'] });
    },
  });

  const promotions = data?.success ? (data.data || []) : [];

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && promo.active) ||
      (statusFilter === 'inactive' && !promo.active);
    const matchesType = typeFilter === 'all' || promo.display_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAdd = () => {
    setEditingPromotion({
      title: '',
      description: '',
      image: '',
      button_text: '',
      button_url: '',
      start_date: '',
      end_date: '',
      active: true,
      display_type: 'banner',
      display_frequency: 'always',
      frequency_value: 1,
      position: 'top',
      priority: 0,
      close_button: true,
      background_color: '#2563eb',
      text_color: '#ffffff',
      page_visibility: null,
    });
    setShowModal(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion({ ...promotion });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await mediaAPI.upload(file, 'promotions', {});
      if (result.success) {
        const basePath = result.data?.file_path || `uploads/promotions/${result.data?.filename}`;
        setEditingPromotion((prev) => ({ ...prev, image: `${getUploadBase()}${basePath}` }));
      }
    } catch {
      // upload error
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!editingPromotion.title) {
      alert('Please provide a promotion title.');
      return;
    }

    const payload = {
      ...editingPromotion,
      active: editingPromotion.active ? 1 : 0,
      close_button: editingPromotion.close_button ? 1 : 0,
      frequency_value: parseInt(editingPromotion.frequency_value, 10) || 1,
      priority: parseInt(editingPromotion.priority, 10) || 0,
      page_visibility: editingPromotion.page_visibility
        ? JSON.stringify(editingPromotion.page_visibility)
        : null,
    };

    if (editingPromotion.id) {
      updateMutation.mutate({ id: editingPromotion.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const displayTypes = [
    { value: 'banner', label: 'Banner' },
    { value: 'card', label: 'Card' },
    { value: 'popup', label: 'Popup' },
    { value: 'modal', label: 'Modal' },
    { value: 'corner', label: 'Corner' },
    { value: 'inline', label: 'Inline' },
    { value: 'footer', label: 'Footer' },
  ];

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text">Promotions</h1>
          <div className="h-10 w-40 bg-muted/20 rounded animate-pulse" />
        </div>
        <LoadingSkeleton count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load promotions.</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            Promotion Manager
          </h1>
          <p className="text-muted mt-1">
            {promotions.length} total promotions
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Promotion
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Types</option>
              {displayTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredPromotions.length === 0 ? (
        <EmptyState
          message={searchTerm ? 'No promotions match your search.' : 'No promotions found.'}
          type="default"
          action={
            <button onClick={handleAdd} className="btn btn-primary btn-sm">
              Add First Promotion
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <div key={promo.id} className="card overflow-hidden flex flex-col h-full min-h-[480px] hover:shadow-card transition-all duration-300">
              {promo.image ? (
                <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-surface-hover flex-shrink-0 flex-[3]">
                  <img
                    src={resolveAssetUrl(promo.image)}
                    alt={promo.title}
                    className="w-full h-full object-cover object-center block transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/800x450?text=No+Image';
                    }}
                  />
                </div>
              ) : (
                <div className="relative h-64 sm:h-72 md:h-80 w-full bg-surface-hover flex items-center justify-center flex-shrink-0 flex-[3]">
                  <Megaphone className="w-12 h-12 text-muted" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text line-clamp-1">{promo.title}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      promo.active
                        ? 'bg-success/10 text-success'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-3">
                  {promo.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <Target className="w-3 h-3" />
                  <span>{displayTypes.find((d) => d.value === promo.display_type)?.label || promo.display_type}</span>
                  <Calendar className="w-3 h-3 ml-2" />
                  <span>
                    {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'No start'}
                    {' '} -{' '}
                    {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'No end'}
                  </span>
                </div>
                {promo.button_url && (
                  <div className="flex items-center gap-1 text-xs text-primary mb-3">
                    <ExternalLink className="w-3 h-3" />
                    <span>CTA: {promo.button_text || 'Learn More'}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                    aria-label={`Edit ${promo.title}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id, promo.title)}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                    aria-label={`Delete ${promo.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editingPromotion && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-text">
                {editingPromotion.id ? 'Edit' : 'Add'} Promotion
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-muted hover:text-text rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editingPromotion.title}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, title: e.target.value })
                    }
                    className="input"
                    placeholder="Promotion title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Display Type
                  </label>
                  <select
                    value={editingPromotion.display_type}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, display_type: e.target.value })
                    }
                    className="input"
                  >
                    {displayTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Description
                </label>
                <textarea
                  value={editingPromotion.description}
                  onChange={(e) =>
                    setEditingPromotion({ ...editingPromotion, description: e.target.value })
                  }
                  className="input"
                  rows={3}
                  placeholder="Promotion description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Promotion Image
                </label>
                {editingPromotion.image ? (
                  <div className="relative w-full h-48 sm:h-56 border-2 border-border rounded-xl overflow-hidden bg-surface-hover mb-2 group">
                    <img
                      src={resolveAssetUrl(editingPromotion.image)}
                      alt="Promotion"
                      className="w-full h-full object-cover object-center block"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/1200x600?text=No+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingPromotion((prev) => ({ ...prev, image: '' }))}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-error text-white rounded-lg transition-colors z-10"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-40 border-2 border-border border-dashed rounded-xl flex items-center justify-center bg-surface-hover mb-2">
                    <ImageIcon className="w-8 h-8 text-muted" />
                    <span className="text-sm text-muted ml-2">No image uploaded</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                  disabled={uploading}
                />
                <p className="text-xs text-muted mt-1">
                  Recommended size: 1200x600px. Max 10GB.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editingPromotion.button_text}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, button_text: e.target.value })
                    }
                    className="input"
                    placeholder="e.g., View Deals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Button URL
                  </label>
                  <input
                    type="url"
                    value={editingPromotion.button_url}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, button_url: e.target.value })
                    }
                    className="input"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editingPromotion.start_date}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, start_date: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editingPromotion.end_date}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, end_date: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Position
                  </label>
                  <select
                    value={editingPromotion.position}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, position: e.target.value })
                    }
                    className="input"
                  >
                    {['top', 'bottom', 'left', 'right', 'center', 'header', 'footer', 'sidebar'].map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Priority (higher = shown first)
                  </label>
                  <input
                    type="number"
                    value={editingPromotion.priority}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, priority: parseInt(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingPromotion.background_color || '#2563eb'}
                      onChange={(e) =>
                        setEditingPromotion({ ...editingPromotion, background_color: e.target.value })
                      }
                      className="w-10 h-8 rounded border border-border cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={editingPromotion.background_color || '#2563eb'}
                      onChange={(e) =>
                        setEditingPromotion({ ...editingPromotion, background_color: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingPromotion.text_color || '#ffffff'}
                      onChange={(e) =>
                        setEditingPromotion({ ...editingPromotion, text_color: e.target.value })
                      }
                      className="w-10 h-8 rounded border border-border cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={editingPromotion.text_color || '#ffffff'}
                      onChange={(e) =>
                        setEditingPromotion({ ...editingPromotion, text_color: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Display Frequency
                  </label>
                  <select
                    value={editingPromotion.display_frequency}
                    onChange={(e) =>
                      setEditingPromotion({ ...editingPromotion, display_frequency: e.target.value })
                    }
                    className="input"
                  >
                    {[
                      'always', 'once_per_session', 'once_per_day', 'once_per_week',
                      'once_per_month', 'every_x_visits', 'on_scroll', 'after_x_seconds',
                    ].map((freq) => (
                      <option key={freq} value={freq}>
                        {freq.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPromotion((prev) => ({ ...prev, active: !prev.active }));
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-hover hover:bg-surface transition-colors"
                  >
                    {editingPromotion.active ? (
                      <ToggleRight className="w-5 h-5 text-success" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted" />
                    )}
                    <span className="text-sm">
                      {editingPromotion.active ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <label className="text-sm font-medium text-text">
                  Show Close Button
                </label>
                <input
                  type="checkbox"
                  checked={!!editingPromotion.close_button}
                  onChange={(e) =>
                    setEditingPromotion({
                      ...editingPromotion,
                      close_button: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  uploading ||
                  !editingPromotion.title
                }
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center">
          <div className="bg-surface rounded-xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="text-text">Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionManager;
