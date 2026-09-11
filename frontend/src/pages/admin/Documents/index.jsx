import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Download,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Filter,
  Plus,
  Loader2,
  X,
  ExternalLink,
  Building,
} from 'lucide-react';
import { documentsAPI, adminPropertiesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const DOC_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'deed', label: 'Title Deed' },
  { value: 'title', label: 'Title Certificate' },
  { value: 'tax_receipt', label: 'Tax Receipt' },
  { value: 'approval', label: 'Government Approval' },
  { value: 'survey', label: 'Survey Plan' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

const AdminDocuments = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyIdParam = searchParams.get('property_id');

  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    property_id: propertyIdParam || '',
    title: '',
    description: '',
    document_type: 'deed',
    visibility: 'private',
    file: null,
  });
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    document.title = `Documents | ${businessName} Admin`;
  }, [businessName]);

  useEffect(() => {
    if (propertyIdParam) {
      setUploadForm((prev) => ({ ...prev, property_id: propertyIdParam }));
    }
  }, [propertyIdParam]);

  const limit = 15;

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (typeFilter !== 'all') params.document_type = typeFilter;
    if (propertyIdParam) params.property_id = propertyIdParam;
    return params;
  }, [searchTerm, typeFilter, currentPage, propertyIdParam]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.documents', queryParams],
    queryFn: () => documentsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  // Fetch properties for upload dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['admin.properties.shortList'],
    queryFn: () => adminPropertiesAPI.getAll({ limit: 100 }),
  });

  const propertiesList = propertiesData?.success
    ? (Array.isArray(propertiesData.data) ? propertiesData.data : propertiesData.data?.data || [])
    : [];

  const uploadMutation = useMutation({
    mutationFn: () => documentsAPI.upload(uploadForm.file, uploadForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin.property'] });
      queryClient.invalidateQueries({ queryKey: ['admin.verifications'] });
      setShowUploadModal(false);
      setUploadForm({
        property_id: propertyIdParam || '',
        title: '',
        description: '',
        document_type: 'deed',
        visibility: 'private',
        file: null,
      });
      setUploadError('');
    },
    onError: (err) => {
      setUploadError(err.message || 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin.property'] });
      setShowDeleteModal(false);
      setDocToDelete(null);
    },
  });

  const documents = data?.success
    ? (Array.isArray(data.data) ? data.data : data.data?.data || [])
    : [];
  const totalPages = data?.success ? Math.ceil((data.data.total || 0) / limit) : 0;

  const handleDelete = () => {
    if (docToDelete) {
      deleteMutation.mutate(docToDelete.id);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadForm.file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!uploadForm.property_id) {
      setUploadError('Please select a property.');
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError('Document title is required.');
      return;
    }

    uploadMutation.mutate();
  };

  const formatFileSize = (bytes) => {
    const num = Number(bytes);
    if (!num || isNaN(num)) return 'N/A';
    if (num < 1024) return `${num} B`;
    if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1073741824) return `${(num / 1048576).toFixed(1)} MB`;
    return `${(num / 1073741824).toFixed(2)} GB`;
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return File;
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  };

  const getTypeBadge = (type) => {
    const styles = {
      deed: 'bg-primary/10 text-primary border-primary/20',
      title: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
      tax_receipt: 'bg-success/10 text-success border-success/20',
      approval: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
      survey: 'bg-warning/10 text-warning border-warning/20',
      insurance: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
      other: 'bg-muted/10 text-muted border-border',
    };
    return styles[type] || styles.other;
  };

  const clearPropertyFilter = () => {
    searchParams.delete('property_id');
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Property Documents</h1>
          <p className="text-muted mt-1 text-sm">Manage title deeds, land surveys, tax receipts, and official documentation</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Property Filter Banner */}
      {propertyIdParam && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Building className="w-4 h-4" />
            <span>Filtered by Property ID: #{propertyIdParam}</span>
          </div>
          <button
            onClick={clearPropertyFilter}
            className="text-xs bg-surface hover:bg-surface-hover text-muted hover:text-text px-2.5 py-1 rounded-lg border border-border flex items-center gap-1 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search document title or description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-56"
          >
            {DOC_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load documents</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState message="No documents found for the selected criteria" type="search" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-text">Document</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Property</th>
                    <th className="text-left p-4 font-semibold text-text hidden lg:table-cell">Type</th>
                    <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Size</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Uploaded</th>
                    <th className="text-right p-4 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.mime_type);
                    const serveUrl = documentsAPI.getServeUrl(doc.id);
                    return (
                      <tr key={doc.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text truncate max-w-xs">{doc.title}</p>
                              <p className="text-xs text-muted truncate max-w-xs">{doc.filename}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm">
                          {doc.property_id ? (
                            <Link
                              to={`/admin/properties/${doc.property_id}/edit`}
                              className="text-primary hover:underline font-medium flex items-center gap-1 truncate max-w-xs"
                            >
                              <span>{doc.property_name || `Property #${doc.property_id}`}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-muted">Unlinked</span>
                          )}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeBadge(doc.document_type)}`}>
                            {doc.document_type ? doc.document_type.replace('_', ' ').toUpperCase() : 'OTHER'}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-muted">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted text-xs">
                          {getRelativeTime(doc.created_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedDoc(doc); setShowViewModal(true); }}
                              className="p-1.5 hover:bg-surface rounded-lg border border-border text-muted hover:text-text transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={serveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-surface rounded-lg border border-border text-primary hover:bg-primary/5 transition-colors"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => { setDocToDelete(doc); setShowDeleteModal(true); }}
                              className="p-1.5 hover:bg-error/10 rounded-lg border border-border text-error transition-colors"
                              title="Delete"
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
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedDoc && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Document Information" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card p-3 bg-surface">
                <p className="text-xs text-muted">Title</p>
                <p className="font-semibold text-text">{selectedDoc.title}</p>
              </div>
              <div className="card p-3 bg-surface">
                <p className="text-xs text-muted">Document Type</p>
                <p className="font-semibold text-text capitalize">{selectedDoc.document_type || 'Other'}</p>
              </div>
              <div className="card p-3 bg-surface">
                <p className="text-xs text-muted">File Size</p>
                <p className="font-semibold text-text">{formatFileSize(selectedDoc.file_size)}</p>
              </div>
              <div className="card p-3 bg-surface">
                <p className="text-xs text-muted">Associated Property</p>
                <p className="font-semibold text-text">{selectedDoc.property_name || 'N/A'}</p>
              </div>
            </div>
            {selectedDoc.description && (
              <div className="card p-3 bg-surface">
                <p className="text-xs text-muted mb-1">Description</p>
                <p className="text-sm text-text">{selectedDoc.description}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowViewModal(false)} className="btn btn-outline">Close</button>
              <a
                href={documentsAPI.getServeUrl(selectedDoc.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && docToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Document" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Are you sure you want to delete <strong>{docToDelete.title}</strong>? This file will be permanently deleted from server storage.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending} className="btn btn-error">
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Property Document" size="lg">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {uploadError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs font-medium text-error">
                {uploadError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text mb-1">Property *</label>
              <select
                value={uploadForm.property_id}
                onChange={(e) => setUploadForm({ ...uploadForm, property_id: e.target.value })}
                className="input"
                required
              >
                <option value="">-- Select Property --</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: #{p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Document Title *</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g. Title Deed Certificate / Survey Plan 2024"
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Document Type</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="input"
                >
                  {DOC_TYPES.filter((dt) => dt.value !== 'all').map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Visibility</label>
                <select
                  value={uploadForm.visibility}
                  onChange={(e) => setUploadForm({ ...uploadForm, visibility: e.target.value })}
                  className="input"
                >
                  <option value="private">Private (Admin & Verified Buyers)</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Notes about document validity, registration reference..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">File Attachment * (PDF, Image, Doc)</label>
              <input
                type="file"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] || null })}
                className="input py-2"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={uploadMutation.isPending} className="btn btn-primary flex items-center gap-2">
                {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminDocuments;
