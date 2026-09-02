import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  FileText,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { adminVerificationAPI } from '@/services/api';
import { Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const STATUS_OPTIONS = ['pending', 'under_review', 'verified', 'rejected', 'revoked'];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: Eye },
  verified: { label: 'Verified', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error border-error/20', icon: XCircle },
  revoked: { label: 'Revoked', color: 'bg-muted/10 text-muted border-border', icon: AlertTriangle },
};

const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_BASE || '/homes/backend';

const Verification = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: '', notes: '' });
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.verifications', page, filterStatus, search],
    queryFn: () => adminVerificationAPI.getAll({ page, status: filterStatus, search, per_page: 15 }),
    keepPreviousData: true,
  });

  const verifications = data?.data || data?.verifications || [];
  const meta = data?.meta || {};

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }) => adminVerificationAPI.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.verifications'] });
      setShowModal(false);
      setSelectedItem(null);
    },
  });

  const openReview = (item) => {
    setSelectedItem(item);
    setReviewForm({ status: item.status || 'pending', notes: item.admin_notes || '' });
    setShowModal(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: selectedItem.id, data: reviewForm });
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Property Verifications</h1>
          <p className="text-sm text-muted mt-0.5">Review and approve property verification requests</p>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['pending', 'under_review', 'verified', 'rejected'].map((st) => {
            const count = (data?.counts || {})[st] || 0;
            const cfg = statusConfig[st];
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(filterStatus === st ? '' : st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-smooth ${
                  filterStatus === st ? 'bg-primary text-white border-primary' : `${cfg.color}`
                }`}
              >
                {cfg.label} {count > 0 && `(${count})`}
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
            placeholder="Search by property or owner..."
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
          <option value="">All Statuses</option>
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
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Owner</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Documents</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Submitted</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-surface-hover rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : verifications.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted">
                      <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No verification requests found.</p>
                    </td>
                  </tr>
                )
              : verifications.map((vr) => (
                  <tr key={vr.id} className="hover:bg-surface-hover/50 transition-smooth">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-text line-clamp-1">{vr.property_name || 'Unnamed Property'}</p>
                        {vr.property_location && <p className="text-xs text-muted">{vr.property_location}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-text">{vr.owner_name || vr.user_name || '—'}</p>
                      {vr.owner_email && <p className="text-xs text-muted">{vr.owner_email}</p>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {vr.documents && vr.documents.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {vr.documents.slice(0, 2).map((doc) => (
                            <a
                              key={doc.id}
                              href={`${UPLOAD_BASE}/uploads/documents/${doc.file_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              {doc.title || doc.document_type || 'Document'}
                            </a>
                          ))}
                          {vr.documents.length > 2 && (
                            <span className="text-xs text-muted">+{vr.documents.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No documents</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={vr.status} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-muted text-xs">
                      {getRelativeTime(vr.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {vr.property_slug && (
                          <a
                            href={`/properties/${vr.property_slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-muted/10 text-muted transition-smooth"
                            title="View Property"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openReview(vr)}
                          className="btn btn-sm btn-primary"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">Previous</button>
          <span className="text-sm text-muted">Page {page} of {meta.last_page}</span>
          <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="btn btn-outline btn-sm">Next</button>
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Verification Request" size="lg">
        {selectedItem && (
          <div className="space-y-5">
            {/* Property Info */}
            <div className="p-4 rounded-xl bg-surface-hover/60 border border-border space-y-1">
              <p className="font-semibold text-text">{selectedItem.property_name}</p>
              {selectedItem.property_location && <p className="text-sm text-muted">{selectedItem.property_location}</p>}
              <p className="text-xs text-muted">Submitted by: {selectedItem.owner_name || selectedItem.user_name} • {getRelativeTime(selectedItem.created_at)}</p>
            </div>

            {/* Documents */}
            {selectedItem.documents && selectedItem.documents.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-text mb-2">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedItem.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={`${UPLOAD_BASE}/uploads/documents/${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-smooth"
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{doc.title}</p>
                        <p className="text-xs text-muted">{doc.document_type}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Update Status</label>
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
                <label className="block text-sm font-medium text-text mb-1">Admin Notes / Reason</label>
                <textarea
                  rows={3}
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  className="input"
                  placeholder="Leave a note for the property owner (e.g. reason for rejection)..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary flex items-center gap-2">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  <span>Submit Review</span>
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
