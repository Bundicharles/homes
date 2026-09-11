import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { adminInquiriesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState, Pagination, Modal } from '@/components/Modal';
import { formatNumber, getRelativeTime } from '@/utils';

const AdminMessages = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const limit = 15;

  useEffect(() => {
    document.title = `Messages | ${businessName} Admin`;
  }, [businessName]);

  const queryParams = useMemo(() => {
    const params = { page: currentPage, limit, search: searchTerm };
    if (typeFilter !== 'all') params.type = typeFilter;
    if (readFilter !== 'all') params.is_read = readFilter === 'read' ? 1 : 0;
    return params;
  }, [searchTerm, typeFilter, readFilter, currentPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin.messages', queryParams],
    queryFn: () => adminInquiriesAPI.getAll(queryParams),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminInquiriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.messages'] });
      setShowDeleteModal(false);
      setMessageToDelete(null);
    },
  });

  const messages = data?.success ? (data.data.data || data.data) : [];
  const total = data?.success ? (data.data.total ?? data.data.pagination?.total ?? 0) : 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = () => {
    if (messageToDelete) {
      deleteMutation.mutate(messageToDelete.id);
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      general: 'bg-primary/10 text-primary',
      contact_form: 'bg-primary/10 text-primary',
      website: 'bg-info/10 text-info',
      property: 'bg-success/10 text-success',
      viewing: 'bg-warning/10 text-warning',
      complaint: 'bg-error/10 text-error',
    };
    return styles[type] || 'bg-muted/20 text-muted';
  };

  const getReadBadge = (isRead) => {
    return isRead
      ? 'bg-success/10 text-success'
      : 'bg-warning/10 text-warning';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Messages</h1>
          <p className="text-muted mt-1">View and manage customer inquiries and messages</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search messages by name, email, or content..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-40"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="property">Property</option>
            <option value="viewing">Viewing</option>
            <option value="complaint">Complaint</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => { setReadFilter(e.target.value); setCurrentPage(1); }}
            className="input w-full sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">Failed to load messages</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState message="No messages found" type="search" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-text">Sender</th>
                    <th className="text-left p-4 font-semibold text-text hidden md:table-cell">Subject</th>
                    <th className="text-left p-4 font-semibold text-text hidden lg:table-cell">Property</th>
                    <th className="text-left p-4 font-semibold text-text">Type</th>
                    <th className="text-left p-4 font-semibold text-text">Status</th>
                    <th className="text-left p-4 font-semibold text-text hidden sm:table-cell">Date</th>
                    <th className="text-right p-4 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <Link to={`/admin/messages/${msg.id}`} className="group block">
                          <p className="font-medium text-text group-hover:text-primary transition-colors">{msg.name}</p>
                          <p className="text-sm text-muted">{msg.email}</p>
                        </Link>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted">
                        <Link to={`/admin/messages/${msg.id}`} className="hover:text-primary transition-colors">
                          {msg.subject || 'No subject'}
                        </Link>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted">
                        {msg.property_name ? (
                          <Link to={`/properties/${msg.property_slug}`} className="hover:text-primary hover:underline">
                            {msg.property_name}
                          </Link>
                        ) : (
                          'General'
                        )}
                      </td>
                      <td className="p-4">
                        <span className={['px-2 py-1 rounded-full text-xs font-medium', getTypeBadge(msg.type)].join(' ')}>
                          {msg.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={['px-2 py-1 rounded-full text-xs font-medium', getReadBadge(msg.is_read)].join(' ')}>
                          {msg.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-sm text-muted">
                        {getRelativeTime(msg.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/messages/${msg.id}`}
                            className="p-2 hover:bg-primary/10 text-muted hover:text-primary rounded-lg transition-colors"
                            title="Open Conversation"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { setMessageToDelete(msg); setShowDeleteModal(true); }}
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

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      {showViewModal && selectedMessage && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Message Details" maxWidth="lg">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-text">{selectedMessage.subject || 'No Subject'}</h3>
                <p className="text-muted">From: {selectedMessage.name} ({selectedMessage.email})</p>
                {selectedMessage.phone && <p className="text-muted">Phone: {selectedMessage.phone}</p>}
              </div>
              <span className={['px-2 py-1 rounded-full text-xs font-medium', getTypeBadge(selectedMessage.type)].join(' ')}>
                {selectedMessage.type}
              </span>
            </div>
            {selectedMessage.property_name && (
              <div className="card p-3">
                <p className="text-sm text-muted">Related Property</p>
                <Link to={`/properties/${selectedMessage.property_slug}`} className="text-primary hover:underline">
                  {selectedMessage.property_name}
                </Link>
              </div>
            )}
            <div className="card p-4">
              <p className="text-sm text-muted mb-2">Message</p>
              <p className="text-text whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted">Received: {new Date(selectedMessage.created_at).toLocaleString()}</p>
              <Link
                to={`/admin/messages/${selectedMessage.id}`}
                className="btn btn-primary btn-sm"
              >
                Reply & View Thread
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && messageToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Message" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-muted">Are you sure you want to delete this message? This action cannot be undone.</p>
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

export default AdminMessages;
