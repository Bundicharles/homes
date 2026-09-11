import { resolveAssetUrl } from '@/utils';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Image,
  Trash2,
  Edit2,
  Copy,
  Search,
  X,
  Check,
  Loader2,
  Grid3X3,
  List,
  FileImage,
  Film,
  File,
  ExternalLink,
} from 'lucide-react';
import { mediaAPI } from '@/services/api';
import { Modal } from '@/components/Modal';

const formatBytes = (bytes) => {
  const num = Number(bytes);
  if (!num || isNaN(num)) return '—';
  if (num < 1024) return `${num} B`;
  if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1073741824) return `${(num / 1048576).toFixed(1)} MB`;
  return `${(num / 1073741824).toFixed(2)} GB`;
};

const getFileIcon = (mime) => {
  if (!mime) return <File className="w-8 h-8 text-muted" />;
  if (mime.startsWith('image/')) return <FileImage className="w-8 h-8 text-primary" />;
  if (mime.startsWith('video/')) return <Film className="w-8 h-8 text-success" />;
  return <File className="w-8 h-8 text-muted" />;
};

const MediaLibrary = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.media', page, search],
    queryFn: () => mediaAPI.getAll({ page, search, per_page: 24 }),
    keepPreviousData: true,
  });

  const mediaItems = data?.success ? (data.data.data || data.data) : (data?.data || data?.media || []);
  const pagination = data?.pagination || data?.data?.pagination || {};

  const uploadMutation = useMutation({
    mutationFn: ({ file }) => mediaAPI.upload(file, 'media', { title: file.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.media'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => mediaAPI.update(id, d),
    onSuccess: () => {
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['admin.media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mediaAPI.delete(id),
    onSuccess: () => {
      setShowDeleteModal(false);
      setDeletingId(null);
      setSelectedItems([]);
      queryClient.invalidateQueries({ queryKey: ['admin.media'] });
    },
  });

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate({ file });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [], 'audio/*': [], 'application/pdf': [] },
    maxSize: 10 * 1024 * 1024 * 1024,
  });

  const copyUrl = (item) => {
    const assetPath = resolveAssetUrl(item.file_path || item.path || item.filename);
    const url = assetPath.startsWith('http') ? assetPath : `${window.location.origin}${assetPath}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({ title: item.title || '', alt_text: item.alt_text || '', caption: item.caption || '' });
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const bulkDelete = () => {
    selectedItems.forEach((id) => deleteMutation.mutate(id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Media Library</h1>
          <p className="text-sm text-muted mt-0.5">Manage all uploaded images, videos, and files</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <button onClick={bulkDelete} className="btn btn-sm bg-error text-white hover:bg-error/90">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete {selectedItems.length} Selected
            </button>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn btn-outline btn-sm"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-surface-hover/50'
        }`}
      >
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-text">Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-text">
                {isDragActive ? 'Drop files here' : 'Drag & drop files or click to upload'}
              </p>
              <p className="text-xs text-muted mt-1">Images, Videos, Audio, PDFs — Max 10GB per file</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search media files..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-10"
        />
      </div>

      {/* Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-hover animate-pulse" />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="card p-16 text-center text-muted">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No media files found. Upload some files above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-smooth ${
                selectedItems.includes(item.id) ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              <div className="aspect-square bg-surface-hover">
                {item.mime_type?.startsWith('image/') ? (
                  <img
                    src={resolveAssetUrl(item.file_path || item.path || item.filename)}
                    alt={item.alt_text || item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(item.mime_type)}
                  </div>
                )}
              </div>
              {/* Selection checkmark */}
              <div
                className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth ${
                  selectedItems.includes(item.id)
                    ? 'bg-primary border-primary'
                    : 'bg-white/70 border-border opacity-0 group-hover:opacity-100'
                }`}
              >
                {selectedItems.includes(item.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              {/* Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                  className="w-7 h-7 rounded-lg bg-white/90 text-text hover:text-primary flex items-center justify-center shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                  className="w-7 h-7 rounded-lg bg-white/90 text-text hover:text-primary flex items-center justify-center shadow-sm"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); confirmDelete(item.id); }}
                  className="w-7 h-7 rounded-lg bg-white/90 text-error hover:bg-error hover:text-white flex items-center justify-center shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Filename */}
              <div className="p-2 border-t border-border bg-surface">
                <p className="text-xs text-text font-medium truncate">{item.title || item.original_name || 'Untitled'}</p>
                <p className="text-xs text-muted">{formatBytes(item.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase w-8">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedItems(e.target.checked ? mediaItems.map((m) => m.id) : [])
                    }
                    checked={selectedItems.length === mediaItems.length && mediaItems.length > 0}
                    className="checkbox"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase">Preview</th>
                <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-muted text-xs uppercase hidden md:table-cell">Size</th>
                <th className="px-4 py-3 text-right font-semibold text-muted text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mediaItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover/50 transition-smooth">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="checkbox"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-hover flex items-center justify-center">
                      {item.mime_type?.startsWith('image/') ? (
                        <img
                          src={resolveAssetUrl(item.file_path || item.path || item.filename)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        getFileIcon(item.mime_type)
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text text-sm">{item.title || item.original_name}</p>
                    {item.alt_text && <p className="text-xs text-muted">{item.alt_text}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted text-xs">{item.mime_type}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted text-xs">{formatBytes(item.file_size)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-smooth">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => copyUrl(item)} className="p-1.5 rounded-lg hover:bg-success/10 text-muted hover:text-success transition-smooth">
                        {copiedId === item.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={resolveAssetUrl(item.file_path || item.path || item.filename)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-muted/10 text-muted transition-smooth"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => confirmDelete(item.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-smooth">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-outline btn-sm"
          >
            Previous
          </button>
          <span className="text-sm text-muted">Page {page} of {pagination.total_pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="btn btn-outline btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Media Details">
        <div className="space-y-4">
          {editItem?.mime_type?.startsWith('image/') && (
            <img
              src={resolveAssetUrl(editItem?.file_path || editItem?.path || editItem?.filename)}
              alt=""
              className="w-full max-h-48 object-contain rounded-xl bg-surface-hover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Alt Text</label>
            <input
              type="text"
              value={editForm.alt_text}
              onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
              className="input"
              placeholder="Describe the image for accessibility"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Caption</label>
            <input
              type="text"
              value={editForm.caption}
              onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditItem(null)} className="btn btn-outline">Cancel</button>
            <button
              onClick={() => updateMutation.mutate({ id: editItem.id, data: editForm })}
              disabled={updateMutation.isPending}
              className="btn btn-primary"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Media File">
        <div className="space-y-4">
          <p className="text-sm text-muted">Are you sure you want to permanently delete this file? This cannot be undone and may break pages that use it.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Cancel</button>
            <button
              onClick={() => deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              className="btn bg-error text-white hover:bg-error/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete File'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MediaLibrary;
