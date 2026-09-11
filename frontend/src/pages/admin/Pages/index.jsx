import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const AdminPages = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Pages | ${businessName} Admin`;
  }, [businessName]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.pages'],
    queryFn: () => pagesAPI.getAll(),
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pagesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.pages'] });
      setShowDeleteModal(false);
      setPageToDelete(null);
    },
  });

  const pages = data?.success ? data.data : [];
  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (pageToDelete) {
      deleteMutation.mutate(pageToDelete.id);
    }
  };

  const getStatusBadge = (isPublished) => {
    return isPublished
      ? 'bg-success/10 text-success'
      : 'bg-muted/20 text-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Pages</h1>
          <p className="text-muted mt-1">Manage CMS pages like About, Services, Contact, etc.</p>
        </div>
        <Link to="/admin/pages/builder/new" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Page
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load pages</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : filteredPages.length === 0 ? (
        <EmptyState message="No pages found" type="search" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-text">Page</th>
                  <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Slug</th>
                  <th className="text-left p-4 font-semibold text-text">Status</th>
                  <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Updated</th>
                  <th className="text-right p-4 font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{page.title}</p>
                          <p className="text-sm text-muted hidden md:block">{page.meta_title || page.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted">
                        <Globe className="w-3 h-3" /> /{page.slug}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={['px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(page.is_published)].join(' ')}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-muted">
                      {getRelativeTime(page.updated_at || page.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/pages/builder/${page.id}`}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted hover:text-primary"
                          title="Edit Page"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => { setSelectedPage(page); setShowViewModal(true); }}
                          className="p-2 hover:bg-surface rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => setPageToDelete(page)}
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
      )}

      {showViewModal && selectedPage && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={selectedPage.title} maxWidth="lg">
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-sm text-muted mb-2">Content</p>
              <div className="prose max-w-none text-text" dangerouslySetInnerHTML={{ __html: selectedPage.content }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-sm text-muted">URL Slug</p>
                <p className="font-medium">/{selectedPage.slug}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-muted">Status</p>
                <p className="font-medium">{selectedPage.is_published ? 'Published' : 'Draft'}</p>
              </div>
            </div>
            {selectedPage.meta_description && (
              <div className="card p-4">
                <p className="text-sm text-muted mb-2">Meta Description</p>
                <p className="text-text text-sm">{selectedPage.meta_description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && pageToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Page" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete <strong>{pageToDelete.title}</strong>? This action cannot be undone.</p>
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

export default AdminPages;
