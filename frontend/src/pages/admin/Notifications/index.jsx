import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, MessageCircle, Calendar, Package } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useNotifications } from '@/context/NotificationContext';
import { EmptyState } from '@/components/Modal';
import { getRelativeTime } from '@/utils';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'message':
    case 'inquiry_admin_reply':
    case 'inquiry_customer_reply':
      return <MessageCircle className="w-5 h-5 text-primary" />;
    case 'viewing':
      return <Calendar className="w-5 h-5 text-secondary" />;
    case 'inquiry':
    case 'new_inquiry':
      return <Package className="w-5 h-5 text-accent" />;
    default:
      return <Bell className="w-5 h-5 text-muted" />;
  }
};

const AdminNotifications = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllRead,
    markRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    document.title = `Notifications | ${businessName} Admin`;
  }, [businessName]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
          <p className="text-muted text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-outline gap-2 text-sm self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-8">
          <EmptyState message="No notifications yet" />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-4 flex items-start gap-4 transition-colors ${
                !notification.is_read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text text-sm">{notification.title}</p>
                  {!notification.is_read && (
                    <span className="badge badge-primary text-[10px]">New</span>
                  )}
                </div>
                {notification.message && (
                  <p className="text-sm text-muted mt-1 line-clamp-2">{notification.message}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {notification.created_at ? getRelativeTime(notification.created_at) : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.is_read && (
                  <button
                    onClick={() => markRead(notification.id)}
                    className="p-2 text-muted hover:text-primary rounded-lg hover:bg-surface-hover transition-colors"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted text-center">
        Manage your account from{' '}
        <Link to="/admin/profile" className="text-primary hover:underline">
          your profile
        </Link>
        .
      </p>
    </div>
  );
};

export default AdminNotifications;