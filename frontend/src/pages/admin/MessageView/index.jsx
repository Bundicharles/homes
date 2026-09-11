import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  Send,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { adminInquiriesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, Modal } from '@/components/Modal';
import { formatPrice, getRelativeTime } from '@/utils';
import VatExcl from '@/components/VatExcl';

const STATUS_LIST = ['Unread', 'Read', 'In Progress', 'Replied', 'Closed', 'Spam'];

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin.message', id],
    queryFn: () => adminInquiriesAPI.getById(id),
    enabled: !!id,
  });

  const inquiry = data?.success ? data.data : null;

  useEffect(() => {
    if (inquiry) {
      document.title = `Inquiry: ${inquiry.name} | ${businessName} Admin`;
      setStatusUpdate(inquiry.status || 'Read');
    }
  }, [inquiry, businessName]);

  // Reply Mutation
  const replyMutation = useMutation({
    mutationFn: (payload) => adminInquiriesAPI.addMessage(id, payload),
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin.message', id] });
      queryClient.invalidateQueries({ queryKey: ['admin.messages'] });
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus) => adminInquiriesAPI.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.message', id] });
      queryClient.invalidateQueries({ queryKey: ['admin.messages'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => adminInquiriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.messages'] });
      navigate('/admin/messages');
    },
  });

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    replyMutation.mutate({
      message: replyMessage,
      is_internal_note: isInternalNote,
      update_status: isInternalNote ? null : 'Replied',
    });
  };

  const handleStatusChange = (e) => {
    const nextStatus = e.target.value;
    setStatusUpdate(nextStatus);
    statusMutation.mutate(nextStatus);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-surface rounded-2xl border border-border">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Message Not Found</h2>
        <p className="text-muted mb-6">The inquiry message could not be loaded or has been deleted.</p>
        <Link to="/admin/messages" className="btn btn-primary">
          Back to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/messages"
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">Inquiry Conversation</h1>
            <p className="text-sm text-muted">From {inquiry.name} • {getRelativeTime(inquiry.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusUpdate}
            onChange={handleStatusChange}
            disabled={statusMutation.isPending}
            className="input w-auto font-medium"
          >
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl border border-border hover:border-error text-muted hover:text-error transition-smooth"
            title="Delete Inquiry"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SENDER & PROPERTY INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sender details */}
        <div className="md:col-span-2 card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Sender Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted flex-shrink-0" />
              <span className="font-semibold text-text">{inquiry.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted flex-shrink-0" />
              <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline truncate">
                {inquiry.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted flex-shrink-0" />
              <a href={`tel:${inquiry.phone}`} className="text-text hover:text-primary">
                {inquiry.phone || 'N/A'}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted flex-shrink-0" />
              <span className="text-muted">{new Date(inquiry.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Attached property */}
        <div className="card p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Related Property</h3>
          {inquiry.property_name ? (
            <div>
              <p className="font-semibold text-text text-sm line-clamp-1">{inquiry.property_name}</p>
              {inquiry.price && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-bold text-primary">
                    {formatPrice(inquiry.price, inquiry.currency || 'KES')}
                  </p>
                  <VatExcl />
                </div>
              )}
              {inquiry.property_slug && (
                <a
                  href={`/properties/${inquiry.property_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  <span>View Property</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">General Contact Inquiry (No specific property)</p>
          )}
        </div>
      </div>

      {/* CONVERSATION THREAD */}
      <div className="card p-6 space-y-6">
        <h3 className="text-base font-bold text-text">Messages & Notes</h3>

        {/* Original Message */}
        <div className="p-5 rounded-2xl bg-surface-hover/60 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                {inquiry.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{inquiry.name}</p>
                <p className="text-xs text-muted">Customer Inquiry</p>
              </div>
            </div>
            <span className="text-xs text-muted">{getRelativeTime(inquiry.created_at)}</span>
          </div>

          {inquiry.subject && (
            <p className="text-sm font-semibold text-primary">Subject: {inquiry.subject}</p>
          )}

          <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
            {inquiry.message}
          </div>
        </div>

        {/* Subsequent Thread Messages */}
        {inquiry.messages && inquiry.messages.length > 0 && (
          <div className="space-y-4 pt-2">
            {inquiry.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border ${
                  msg.is_internal_note
                    ? 'bg-warning/5 border-warning/30 text-text'
                    : 'bg-primary/5 border-primary/20 text-text ml-6 sm:ml-10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {msg.is_internal_note ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-warning uppercase">
                        <Lock className="w-3 h-3" /> Internal Staff Note
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-primary uppercase">
                        Staff Reply ({msg.sender_name || 'Agent'})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{getRelativeTime(msg.created_at)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* REPLY BOX */}
        <form onSubmit={handleSendReply} className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text">Add Reply or Internal Note</h4>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted hover:text-text">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="checkbox"
              />
              <span>Mark as Internal Staff Note</span>
            </label>
          </div>

          <textarea
            rows={4}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder={
              isInternalNote
                ? 'Type an internal note visible only to staff members...'
                : `Type your reply to ${inquiry.name}...`
            }
            className={`input ${isInternalNote ? 'border-warning/50 bg-warning/5' : ''}`}
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={replyMutation.isPending || !replyMessage.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              {replyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isInternalNote ? 'Save Internal Note' : 'Send Reply'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Inquiry Message"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete the inquiry thread from{' '}
            <strong>{inquiry.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="btn bg-error text-white hover:bg-error/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessageView;
