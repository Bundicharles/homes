import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Star,
  Quote,
  Eye,
} from 'lucide-react';
import { testimonialsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { getRelativeTime, extractList, extractTotal } from '@/utils';

const EMPTY_FORM = {
  name: '',
  title: '',
  content: '',
  rating: 5,
  status: 'approved',
};

const isPublished = (item) =>
  item?.is_published === true ||
  item?.is_published === 1 ||
  item?.status === 'approved';

const AdminTestimonials = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings?.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Testimonials | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (statusFilter === 'published') params.status = 'approved';
    if (statusFilter === 'draft') params.status = 'pending';
    if (statusFilter === 'rejected') params.status = 'rejected';
    return params;
  }, [searchTerm, statusFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.testimonials', queryParams],
    queryFn: () => testimonialsAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editItem ? testimonialsAPI.update(editItem.id, payload) : testimonialsAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.testimonials'] });
      setShowFormModal(false);
      setEditItem(null);
      setForm(EMPTY_FORM);
      setFormErrors({});
    },
    onError: (err) => setFormErrors(err.errors || { name: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => testimonialsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.testimonials'] });
      setShowDeleteModal(false);
      setTestimonialToDelete(null);
    },
  });

  const testimonials = extractList(data);
  const total = extractTotal(data, testimonials.length);
  const totalPages = Math.ceil(total / limit);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || '',
      title: item.title || '',
      content: item.content || '',
      rating: Number(item.rating) || 5,
      status: item.status || (isPublished(item) ? 'approved' : 'pending'),
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Testimonials</h1>
          <p className="text-muted mt-1">Manage customer testimonials and reviews</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="published">Approved</option>
            <option value="draft">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load testimonials</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : testimonials.length === 0 ? (
        <EmptyState
          message="No testimonials found"
          type="search"
          action={
            <button type="button" onClick={openCreate} className="btn btn-primary">
              Add Testimonial
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card p-6 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                    {testimonial.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text truncate">{testimonial.name}</h3>
                    <p className="text-sm text-muted">{testimonial.rating ? `${testimonial.rating}/5` : 'No rating'}</p>
                  </div>
                  <span className={['px-2 py-1 rounded-full text-xs font-medium flex-shrink-0', isPublished(testimonial) ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted'].join(' ')}>
                    {testimonial.status || (isPublished(testimonial) ? 'approved' : 'pending')}
                  </span>
                </div>
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10" />
                  <p className="text-text text-sm line-clamp-3 pl-4">{testimonial.content}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{getRelativeTime(testimonial.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedTestimonial(testimonial); setShowViewModal(true); }}
                      className="p-2 hover:bg-surface rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => openEdit(testimonial)}
                      className="p-2 hover:bg-surface rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => { setTestimonialToDelete(testimonial); setShowDeleteModal(true); }}
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

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      {showViewModal && selectedTestimonial && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Testimonial Details" maxWidth="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {selectedTestimonial.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{selectedTestimonial.name}</h3>
                <p className="text-muted">{selectedTestimonial.title || (selectedTestimonial.rating ? `${selectedTestimonial.rating}/5 rating` : 'No rating')}</p>
              </div>
            </div>
            <div className="card p-4">
              <p className="text-text whitespace-pre-wrap">{selectedTestimonial.content}</p>
            </div>
            <p className="text-sm text-muted">Submitted: {selectedTestimonial.created_at ? new Date(selectedTestimonial.created_at).toLocaleString() : '—'}</p>
          </div>
        </Modal>
      )}

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={editItem ? 'Edit Testimonial' : 'Add Testimonial'}
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="input w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              {formErrors.name && <p className="text-error text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title / role</label>
              <input
                className="input w-full"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  className="input w-full"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} / 5</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="input w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="input w-full min-h-[120px]"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
              {formErrors.content && <p className="text-error text-xs mt-1">{formErrors.content}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
                {saveMutation.isPending ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && testimonialToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Testimonial" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete this testimonial from <strong>{testimonialToDelete.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => deleteMutation.mutate(testimonialToDelete.id)} disabled={deleteMutation.isPending} className="btn btn-error">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTestimonials;
