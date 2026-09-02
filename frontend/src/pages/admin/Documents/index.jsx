import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Download,
  Trash2,
  Eye,
  FileText,
  Image,
  File,
  ChevronLeft,
  ChevronRight,
  Upload,
  Filter,
} from 'lucide-react';
import { documentsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const AdminDocuments = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Documents | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (typeFilter !== 'all') params.document_type = typeFilter;
    return params;
  }, [searchTerm, typeFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.documents', queryParams],
    queryFn: () => documentsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.documents'] });
      setShowDeleteModal(false);
      setDocToDelete(null);
    },
  });

  const documents = data?.success ? data.data.data || data.data : [];
  const totalPages = data?.success ? Math.ceil((data.data.total || 0) / limit) : 0;
  const total = data?.success ? (data.data.total || 0) : 0;

  const handleDelete = () => {
    if (docToDelete) {
      deleteMutation.mutate(docToDelete.id);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return File;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  };

  const getTypeBadge = (type) => {
    const styles = {
      title_deed: 'bg-primary/10 text-primary',
      sale_agreement: 'bg-success/10 text-success',
      survey_plan: 'bg-warning/10 text-warning',
      other: 'bg-muted/20 text-muted',
    };
    return styles[type] || 'bg-muted/20 text-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Documents</h1>
          <p className="text-muted mt-1">Manage property documents and files</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-48"
          >
            <option value="all">All Types</option>
            <option value="title_deed">Title Deed</option>
            <option value="sale_agreement">Sale Agreement</option>
            <option value="survey_plan">Survey Plan</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load documents</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState message="No documents found" type="search" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
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
                <tbody>
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.mime_type);
                    return (
                      <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-text truncate max-w-xs">{doc.title}</p>
                              <p className="text-sm text-muted truncate max-w-xs">{doc.filename}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted">
                          {doc.property_name || 'N/A'}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className={['px-2 py-1 rounded-full text-xs font-medium', getTypeBadge(doc.document_type)].join(' ')}>
                            {doc.document_type}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-sm text-muted">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted">
                          {getRelativeTime(doc.created_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedDoc(doc); setShowViewModal(true); }}
                              className="p-2 hover:bg-surface rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-muted" />
                            </button>
                            <a
                              href={`/api/admin/documents/serve/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-surface rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-muted" />
                            </a>
                            <button
                              onClick={() => { setDocToDelete(doc); setShowDeleteModal(true); }}
                              className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-error" />
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

      {showViewModal && selectedDoc && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Document Details" maxWidth="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">Title</p>
                <p className="font-medium">{selectedDoc.title}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Type</p>
                <p className="font-medium">{selectedDoc.document_type}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">File Size</p>
                <p className="font-medium">{formatFileSize(selectedDoc.file_size)}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Property</p>
                <p className="font-medium">{selectedDoc.property_name || 'N/A'}</p>
              </div>
            </div>
            {selectedDoc.description && (
              <div className="card p-4">
                <p className="text-sm text-muted mb-2">Description</p>
                <p className="text-text">{selectedDoc.description}</p>
              </div>
            )}
            <a
              href={`/api/admin/documents/serve/${selectedDoc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Download Document
            </a>
          </div>
        </Modal>
      )}

      {showDeleteModal && docToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Document" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete <strong>{docToDelete.title}</strong>? This action cannot be undone.</p>
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

export default AdminDocuments;
