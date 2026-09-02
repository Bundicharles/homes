import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Info,
  Save,
  Edit,
  Trash2,
  Plus,
  Search,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';
import { formatNumber } from '@/utils';

const AdminEarbInfo = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Prime Realty Kenya';
  const queryClient = useQueryClient();

  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = `EARB Information | ${businessName} Admin`;
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.earb'],
    queryFn: () => settingsAPI.getEarbInfo(),
  });

  const updateMutation = useMutation({
    mutationFn: (earbData) => settingsAPI.updateEarbInfo(earbData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.earb'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      setShowModal(false);
      setEditingItem(null);
    },
  });

  const earbInfo = data?.success ? (data.data || []) : [];

  const filteredInfo = searchTerm
    ? earbInfo.filter(
        (item) =>
          item.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.key_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.value || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : earbInfo;

  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem({
      key_name: '',
      display_name: '',
      value: '',
      field_type: 'text',
      sort_order: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingItem.display_name || !editingItem.key_name) return;

    const payload = filteredInfo.map((item) =>
      item.id === editingItem.id ? editingItem : item
    );

    if (!payload.some((item) => item.id === editingItem.id)) {
      payload.push(editingItem);
    }

    updateMutation.mutate(payload);
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File' },
    { value: 'boolean', label: 'Boolean (Yes/No)' },
  ];

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load EARB information.</p>
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
            EARB Information
          </h1>
          <p className="text-muted mt-1">
            Manage Kenya Real Estate Regulatory Authority (EARBA) registration and certification details.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Info
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search EARB info..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredInfo.length === 0 ? (
        <EmptyState
          message={searchTerm ? 'No matching EARB info found.' : 'No EARB information available.'}
          type="search"
          action={
            <button onClick={handleAddNew} className="btn btn-primary btn-sm">
              Add Info
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Display Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Key
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Order
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInfo.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-text">{item.display_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-muted">{item.key_name}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text max-w-xs break-all">
                      {item.value ? (
                        item.field_type === 'url' ? (
                          <a
                            href={item.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {item.value}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : item.value.length > 80 ? (
                          <span title={item.value}>
                            {item.value.slice(0, 80)}...
                          </span>
                        ) : (
                          item.value
                        )
                      ) : (
                        <span className="text-muted italic">Empty</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted">{item.field_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted">{item.sort_order}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                        aria-label={`Edit ${item.display_name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && editingItem && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-4 border-b border-border">
              <h3 className="text-xl font-bold text-text">
                {editingItem.id ? 'Edit' : 'Add'} EARB Info Item
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={editingItem.key_name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, key_name: e.target.value })
                  }
                  className="input"
                  placeholder="e.g., earb_registration_number"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingItem.display_name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, display_name: e.target.value })
                  }
                  className="input"
                  placeholder="e.g., EARB Registration Number"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Value
                </label>
                {editingItem.field_type === 'textarea' ? (
                  <textarea
                    value={editingItem.value || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, value: e.target.value })
                    }
                    className="input"
                    rows={3}
                  />
                ) : (
                  <input
                    type={editingItem.field_type === 'number' ? 'number' : editingItem.field_type === 'date' ? 'date' : 'text'}
                    value={editingItem.value || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, value: e.target.value })
                    }
                    className="input"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                    Field Type
                  </label>
                  <select
                    value={editingItem.field_type}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, field_type: e.target.value })
                    }
                    className="input"
                  >
                    {fieldTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={!!editingItem.is_active}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, is_active: e.target.checked ? 1 : 0 })
                  }
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-text">
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
                disabled={updateMutation.isPending || !editingItem.display_name || !editingItem.key_name}
                className="btn btn-primary"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEarbInfo;
