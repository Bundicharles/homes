import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { resolveAssetUrl } from '@/utils';

const CustomerTopbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();

  const displayName = user?.name || 'Customer';
  const profileImage =
    resolveAssetUrl(user?.profile_image) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff`;

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden -ml-2 p-2 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-smooth shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-base sm:text-lg font-semibold text-text truncate min-w-0">
            Welcome, {displayName}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            to="/dashboard/notifications"
            onClick={handleMarkAllRead}
            className="relative p-2 text-muted hover:text-primary transition-smooth"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-error rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link to="/dashboard/profile" className="flex items-center gap-2">
            <img
              src={profileImage}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="hidden sm:inline-block text-sm font-medium text-text">
              {displayName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default CustomerTopbar;
