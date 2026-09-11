import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { inquiriesAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  MessageCircle,
  Search,
  Send,
  X,
  Clock,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { LoadingSkeleton, EmptyState, Modal } from '@/components/Modal';
import { getRelativeTime } from '@/utils';
import { useSettings } from '@/context/SettingsContext';

const MyInquiries = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.title = `My Inquiries | ${businessName}`;
  }, [businessName]);

  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && inquiries.length > 0 && !detailModalOpen) {
      const target = inquiries.find((i) => String(i.id) === String(openId));
      if (target) {
        setSelectedInquiry(target);
        setDetailModalOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, inquiries, detailModalOpen, setSearchParams]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-inquiries'],
    queryFn: () => inquiriesAPI.getMine(),
    enabled: !!user,
    retry: false,
  });

  const { data: detailData, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['customer-inquiry', selectedInquiry?.id],
    queryFn: () => inquiriesAPI.getById(selectedInquiry.id),
    enabled: !!selectedInquiry && detailModalOpen,
  });

  const inquiryDetail = detailData?.success ? detailData.data : null;
  const messages = inquiryDetail?.messages || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const replyMutation = useMutation({
    mutationFn: (text) => inquiriesAPI.reply(selectedInquiry.id, { message: text }),
    onSuccess: () => {
      setReplyText('');
      refetchDetail();
      queryClient.invalidateQueries({ queryKey: ['customer-inquiries'] });
    },
  });

  const inquiries = data?.success ? (data.data.data || data.data) : [];

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailModalOpen(true);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    replyMutation.mutate(text);
  };

  const filteredInquiries = searchTerm
    ? inquiries.filter(
        (inq) =>
          inq.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(inq.id).includes(searchTerm)
      )
    : inquiries;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Unread':
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'Read':
      case 'In Progress':
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Closed':
      case 'closed':
        return <PauseCircle className="w-4 h-4 text-muted" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusClass = (status) => {
    const base = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full';
    switch (status) {
      case 'Unread':
      case 'pending':
        return `${base} bg-warning/10 text-warning`;
      case 'Read':
      case 'In Progress':
      case 'responded':
        return `${base} bg-success/10 text-success`;
      case 'Closed':
      case 'closed':
        return `${base} bg-muted/10 text-muted`;
      default:
        return `${base} bg-muted/10 text-muted`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text mb-6">My Inquiries</h1>
        <LoadingSkeleton count={5} type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load inquiries. Please try again.</p>
        <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">My Inquiries</h1>
        <p className="text-muted mt-1">
          {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} total
        </p>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredInquiries.length === 0 ? (
        <EmptyState
          message={searchTerm ? 'No inquiries match your search.' : 'You have no inquiries yet.'}
          action={
            !searchTerm ? (
              <Link to="/properties" className="btn btn-primary btn-sm">Browse Properties</Link>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Inquiry</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">Messages</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text">{inquiry.subject || 'No subject'}</p>
                      <p className="text-xs text-muted">{getRelativeTime(inquiry.created_at)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text">
                      {inquiry.property?.name || inquiry.property_name || 'General Inquiry'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusClass(inquiry.status)}>
                        {getStatusIcon(inquiry.status)}
                        <span className="capitalize">{(inquiry.status || 'pending').toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{inquiry.message_count || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(inquiry)}
                        className="btn btn-primary btn-sm inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedInquiry(null);
          setReplyText('');
        }}
        title={`Inquiry #${selectedInquiry?.id}`}
        maxWidth="2xl"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-text">{selectedInquiry.subject || 'No subject'}</h3>
                {selectedInquiry.property && (
                  <Link
                    to={`/properties/${selectedInquiry.property.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedInquiry.property.name}
                  </Link>
                )}
              </div>
              <span className={getStatusClass(selectedInquiry.status)}>
                {getStatusIcon(selectedInquiry.status)}
                <span className="capitalize">{(selectedInquiry.status || 'pending').toLowerCase()}</span>
              </span>
            </div>

            <div className="border border-border rounded-lg max-h-80 overflow-y-auto p-4 bg-background space-y-3">
              {detailLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted" /></div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const isCustomer = msg.sender_type === 'customer';
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isCustomer ? 'bg-primary text-white' : 'bg-surface-hover text-text'
                      }`}>
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {isCustomer ? 'You' : msg.sender_name || businessName}
                          <span className="ml-2 opacity-70">{getRelativeTime(msg.created_at)}</span>
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedInquiry.status !== 'Closed' && (
              <form onSubmit={handleSendReply} className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="input flex-1 resize-none"
                  disabled={replyMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="btn btn-primary inline-flex items-center gap-1 self-end"
                >
                  {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </form>
            )}

            {replyMutation.isError && (
              <p className="text-sm text-error">
                {replyMutation.error?.message || 'Failed to send reply.'}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyInquiries;
