import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCircle,
  Trash2,
  AlertCircle,
  Package,
  MessageCircle,
  Calendar,
  Reply,
  Home,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useNotifications } from '@/context/NotificationContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';
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

const getNotificationLink = (notification) => {
  if (notification.reference_type === 'inquiry' && notification.reference_id) {
    return `/dashboard/inquiries?open=${notification.reference_id}`;
  }
  if (notification.reference_type === 'viewing' && notification.reference_id) {
    return `/dashboard/viewings`;
  }
  return null;
};

const CustomerNotifications = () => {
  const { settings } = useSettings();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllRead,
    markRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const businessName = settings.business_name || 'Hemaprin Homes';

  useEffect(() => {
    document.title = `Notifications | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'View all your notifications, mark them as read, and manage your notification preferences.'
      );
    }
  }, [businessName]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text mb-6">Notifications</h1>
        <LoadingSkeleton count={6} type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            Notifications
          </h1>
          <p className="text-muted mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
              : 'All notifications read'}
          </p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-outline btn-sm w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          message="You have no notifications."
          type="default"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const content = (
              <div className="card p-4 flex items-start gap-4 transition-colors hover:shadow-card">
                <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-text ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted mt-1 line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" aria-label="Unread" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                    <span>{getRelativeTime(notification.created_at)}</span>
                    {notification.reference_type && (
                      <span className="capitalize">Ref: {notification.reference_type}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.is_read && (
                    <button
                      onClick={(e) => { e.preventDefault(); markRead(notification.id); }}
                      className="p-1.5 text-muted hover:text-primary rounded transition-colors"
                      aria-label="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); deleteNotification(notification.id); }}
                    className="p-1.5 text-muted hover:text-error rounded transition-colors"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
            return link ? (
              <Link
                key={notification.id}
                to={link}
                onClick={() => { if (!notification.is_read) markRead(notification.id); }}
                className="block"
              >
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerNotifications;
