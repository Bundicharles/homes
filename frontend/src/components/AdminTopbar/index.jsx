import { useState } from 'react';
import { Bell, User, Settings, LogOut, Menu, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const AdminTopbar = ({ onMenuToggle }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();

  const displayName = user?.name || 'Admin';
  const profileImage =
    user?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff`;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllRead();
      setNotificationsOpen(false);
    }
  };

  const recentNotifications = (notifications || []).slice(0, 5);

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="hidden lg:inline-block p-2 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-smooth"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-text">
            Prime Realty Kenya
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-muted hover:text-primary transition-smooth"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationsOpen(false)}
              />
            )}

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <h3 className="font-medium text-text">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:text-primary-hover"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted text-sm">
                      No notifications
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover/50 ${
                          !notification.is_read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          if (!notification.is_read) markRead(notification.id);
                          setNotificationsOpen(false);
                        }}
                      >
                        <p className="font-medium text-sm text-text">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {recentNotifications.length > 0 && (
                  <Link
                    to="/admin/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-3 text-center text-sm text-primary hover:bg-surface-hover/50 border-t border-border"
                  >
                    View all notifications
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-smooth"
              aria-label="User menu"
            >
              <img
                src={profileImage}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden sm:inline-block text-sm font-medium text-text">
                {displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {profileOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
            )}

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
                <Link
                  to="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
