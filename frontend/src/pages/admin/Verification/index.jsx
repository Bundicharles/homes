import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  ExternalLink,
  AlertTriangle,
  FileCheck,
  Edit,
  FolderOpen,
} from 'lucide-react';
import { adminVerificationAPI, documentsAPI } from '@/services/api';
import { getUploadBase } from '@/utils';
import { Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const STATUS_OPTIONS = [
  'Pending',
  'Under Review',
  'Documents Submitted',
  'Verified',
  'Verification Required',
  'Not Verified',
];

const statusConfig = {
  Pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  'Under Review': { label: 'Under Review', color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', icon: Eye },
  'Documents Submitted': { label: 'Docs Submitted', color: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400', icon: FileCheck },
  Verified: { label: 'Verified', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  'Verification Required': { label: 'Verification Required', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
  'Not Verified': { label: 'Not Verified', color: 'bg-error/10 text-error border-error/20', icon: XCircle },
};

const normalizeStatusKey = (status) => {
  if (!status) return 'Pending';
  const str = String(status).trim();
  const lower = str.toLowerCase();
  if (lower === 'pending') return 'Pending';
  if (lower === 'under_review' || lower === 'under review') return 'Under Review';
  if (lower === 'documents_submitted' || lower === 'documents submitted') return 'Documents Submitted';
  if (lower === 'verified') return 'Verified';
  if (lower === 'verification_required' || lower === 'verification required') return 'Verification Required';
  if (lower === 'not_verified' || lower === 'not verified' || lower === 'rejected') return 'Not Verified';
  return str;
};

const Verification = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'Verified', notes: '' });
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.verifications', page, filterStatus, search],
    queryFn: () => adminVerificationAPI.getAll({ page, status: filterStatus, search, limit: 15 }),
    keepPreviousData: true,
  });

  // Fetch documents for selected property in review modal
  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['admin.property.documents', selectedItem?.id],
    queryFn: () => documentsAPI.getAll({ property_id: selectedItem?.id }),
    enabled: !!selectedItem?.id && showModal,
  });

  const verifications = data?.success
    ? (Array.isArray(data.data) ? data.data : data.data?.data || [])
    : [];
  const pagination = data?.pagination || data?.data?.pagination || {};
  const propertyDocs = docsData?.success
    ? (Array.isArray(docsData.data) ? docsData.data : docsData.data?.data || [])
    : [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => adminVerificationAPI.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin.property'] });
      setShowModal(false);
      setSelectedItem(null);
    },
  });

  const openReview = (item) => {
    setSelectedItem(item);
    const currentStatus = normalizeStatusKey(item.verification_status || item.status);
    setReviewForm({
      status: currentStatus,
      notes: item.verification_notes || item.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: selectedItem.id, data: reviewForm });
  };

  const StatusBadge = ({ status }) => {
    const key = normalizeStatusKey(status);
    const cfg = statusConfig[key] || statusConfig.Pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Property Verification & Audits</h1>
          <p className="text-sm text-muted mt-0.5">Review property documentation and assign verification status</p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((st) => {
            const cfg = statusConfig[st];
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(isSelected ? '' : st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected ? 'bg-primary text-white border-primary shadow-sm' : cfg.color
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search property name or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All Verification Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Property</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Location</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Linked Documents</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
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
              : verifications.length === 0
              ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-text">No verification records found</p>
                      <p className="text-xs text-muted mt-1">Try clearing search filters or selecting a different status.</p>
                    </td>
                  </tr>
                )
              : verifications.map((vr) => {
                  const docCount = Number(vr.document_count || 0);
                  const statusKey = vr.verification_status || vr.status;
                  return (
                    <tr key={vr.id} className="hover:bg-surface-hover/50 transition-smooth">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {vr.primary_image ? (
                            <img
                              src={vr.primary_image.startsWith('http') ? vr.primary_image : `${getUploadBase()}uploads/${vr.primary_image}`}
                              alt={vr.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0 border border-border">
                              <Shield className="w-5 h-5 text-muted" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/admin/properties/${vr.id}/edit`}
                              className="font-semibold text-text hover:text-primary transition-colors line-clamp-1"
                            >
                              {vr.name || 'Unnamed Property'}
                            </Link>
                            <p className="text-xs text-muted">ID: #{vr.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-sm text-text truncate max-w-xs">{vr.location || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate(`/admin/properties/documents?property_id=${vr.id}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-medium text-primary transition-colors"
                          title="View property documents"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{docCount} Document{docCount !== 1 ? 's' : ''}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={statusKey} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vr.slug && (
                            <a
                              href={`/properties/${vr.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border"
                              title="View Public Listing"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            to={`/admin/properties/${vr.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border"
                            title="Edit Property"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openReview(vr)}
                            className="btn btn-xs sm:btn-sm btn-primary"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">Previous</button>
          <span className="text-sm text-muted">Page {page} of {pagination.total_pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={page === pagination.total_pages} className="btn btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Review & Status Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Update Property Verification" size="lg">
        {selectedItem && (
          <div className="space-y-5">
            {/* Property Info */}
            <div className="p-4 rounded-xl bg-surface-hover/60 border border-border space-y-1">
              <p className="font-semibold text-text">{selectedItem.name}</p>
              {selectedItem.location && <p className="text-sm text-muted">{selectedItem.location}</p>}
              <div className="flex items-center gap-2 pt-1 text-xs text-muted">
                <span>Current Status:</span>
                <StatusBadge status={selectedItem.verification_status || selectedItem.status} />
              </div>
            </div>

            {/* Linked Documents Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text">Linked Documents ({propertyDocs.length})</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/admin/properties/documents?property_id=${selectedItem.id}`);
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Manage Documents
                </button>
              </div>

              {docsLoading ? (
                <div className="p-4 text-center text-xs text-muted">Loading documents...</div>
              ) : propertyDocs.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface border border-dashed border-border text-center text-xs text-muted">
                  No documents currently attached to this property.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {propertyDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={documentsAPI.getServeUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text group-hover:text-primary truncate">{doc.title}</p>
                        <p className="text-xs text-muted capitalize">{doc.document_type || 'Document'} • {doc.filename}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 pt-3 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-text mb-1">New Verification Status</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="input"
                  required
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Audit / Verification Notes</label>
                <textarea
                  rows={3}
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  className="input"
                  placeholder="Notes regarding title search, land survey, official approvals or reasons for status change..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary flex items-center gap-2">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  <span>Save Verification Status</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Verification;
