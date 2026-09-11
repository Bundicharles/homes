import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { faqsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const AdminFAQs = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `FAQs | ${businessName} Admin`;
  }, [businessName]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.faqs'],
    queryFn: () => faqsAPI.getAll(),
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => faqsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.faqs'] });
      setShowDeleteModal(false);
      setFaqToDelete(null);
    },
  });

  const faqs = data?.success ? data.data : [];
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = useMemo(() => {
    const cats = new Set(faqs.map(f => f.category).filter(Boolean));
    return Array.from(cats);
  }, [faqs]);

  const handleDelete = () => {
    if (faqToDelete) {
      deleteMutation.mutate(faqToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">FAQs</h1>
          <p className="text-muted mt-1">Manage frequently asked questions</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load FAQs</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <EmptyState message="No FAQs found" type="search" />
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="card p-6 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text mb-2">{faq.question}</h3>
                    <p className="text-muted text-sm line-clamp-2">{faq.answer}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {faq.category && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {faq.category}
                        </span>
                      )}
                      <span className="text-xs text-muted">{getRelativeTime(faq.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedFaq(faq); setShowViewModal(true); }}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-muted" />
                  </button>
                  <button
                    onClick={() => setFaqToDelete(faq)}
                    className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewModal && selectedFaq && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="FAQ Details" maxWidth="lg">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-text mb-2">Question</h3>
              <p className="text-text">{selectedFaq.question}</p>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold text-text mb-2">Answer</h4>
              <p className="text-text whitespace-pre-wrap">{selectedFaq.answer}</p>
            </div>
            {selectedFaq.category && (
              <div className="card p-4">
                <p className="text-sm text-muted">Category</p>
                <p className="font-medium">{selectedFaq.category}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && faqToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete FAQ" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
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

export default AdminFAQs;
