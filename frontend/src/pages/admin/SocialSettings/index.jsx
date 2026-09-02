import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, Pagination } from '@/components/Modal';

const AdminSocialSettings = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Prime Realty Kenya';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = `Social Settings | ${businessName} Admin`;
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.social-links'],
    queryFn: () => settingsAPI.getSocialLinks(),
  });

  const createMutation = useMutation({
    mutationFn: (linkData) => settingsAPI.createSocialLink(linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.social-links'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      setShowModal(false);
      setEditingLink(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingsAPI.updateSocialLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.social-links'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      setShowModal(false);
      setEditingLink(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => settingsAPI.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.social-links'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
    },
  });

  const socialLinks = data?.success ? (data.data || []) : [];

  const filteredLinks = searchTerm
    ? socialLinks.filter(
        (link) =>
          link.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : socialLinks;

  const handleEdit = (link) => {
    setEditingLink({ ...link });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingLink({
      platform: '',
      url: '',
      icon: '',
      sort_order: socialLinks.length,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingLink.id) {
      updateMutation.mutate({ id: editingLink.id, data: editingLink });
    } else {
      createMutation.mutate(editingLink);
    }
  };

  const handleDelete = (id, platform) => {
    if (
      window.confirm(`Are you sure you want to delete "${platform}" social link?`)
    ) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = (link) => {
    updateMutation.mutate({
      id: link.id,
      data: {
        ...link,
        is_active: !link.is_active,
      },
    });
  };

  const popularPlatforms = [
    { value: 'Facebook', icon: 'Facebook' },
    { value: 'Instagram', icon: 'Instagram' },
    { value: 'Twitter', icon: 'Twitter' },
    { value: 'LinkedIn', icon: 'LinkedIn' },
    { value: 'YouTube', icon: 'YouTube' },
    { value: 'TikTok', icon: 'TikTok' },
    { value: 'WhatsApp', icon: 'WhatsApp' },
    { value: 'Telegram', icon: 'Telegram' },
    { value: 'Pinterest', icon: 'Pinterest' },
    { value: 'X', icon: 'Twitter' },
  ];

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load social settings.</p>
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
            Social Media Settings
          </h1>
          <p className="text-muted mt-1">
            Manage social media links displayed on your website.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Social Link
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search social links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 card">
          <Globe className="w-12 h-12 text-muted/50 mx-auto mb-4" />
          <p className="text-muted mb-4">No social links found.</p>
          <button onClick={handleAdd} className="btn btn-primary">
            Add First Link
          </button>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      URL
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {link.icon && (
                            <Globe className="w-5 h-5 text-muted" />
                          )}
                          <span className="font-medium text-text">
                            {link.platform}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {link.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-muted">{link.icon || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(link)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            link.is_active
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {link.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(link)}
                            className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                            aria-label={`Edit ${link.platform}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id, link.platform)}
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                            aria-label={`Delete ${link.platform}`}
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
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {showModal && editingLink && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-text">
                {editingLink.id ? 'Edit' : 'Add'} Social Link
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Platform
                </label>
                <select
                  value={editingLink.platform}
                  onChange={(e) => {
                    const selected = popularPlatforms.find(
                      (p) => p.value === e.target.value
                    );
                    setEditingLink({
                      ...editingLink,
                      platform: e.target.value,
                      icon: selected ? selected.icon : editingLink.icon,
                    });
                  }}
                  className="input"
                >
                  <option value="">Select a platform</option>
                  {popularPlatforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.value}
                    </option>
                  ))}
                </select>
                {!popularPlatforms.some((p) => p.value === editingLink.platform) && editingLink.platform && (
                  <div className="mt-2">
                    <label className="block text-xs text-muted mb-1">
                      Custom Platform Name
                    </label>
                    <input
                      type="text"
                      value={editingLink.platform}
                      onChange={(e) =>
                        setEditingLink({ ...editingLink, platform: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={editingLink.url}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, url: e.target.value })
                  }
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Icon (Lucide name)
                </label>
                <input
                  type="text"
                  value={editingLink.icon || ''}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, icon: e.target.value })
                  }
                  className="input"
                  placeholder="e.g., Facebook, Instagram"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={!!editingLink.is_active}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      is_active: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_active_edit" className="text-sm text-text">
                  Active
                </label>
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
                  !editingLink.platform ||
                  !editingLink.url ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="btn btn-primary"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSocialSettings;
