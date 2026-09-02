import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Heart,
  ShoppingCart,
  MessageCircle,
  Calendar,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CustomerSidebar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { name: 'Profile', icon: User, to: '/dashboard/profile' },
    { name: 'My Favorites', icon: Heart, to: '/dashboard/favorites' },
    { name: 'My Interested', icon: ShoppingCart, to: '/dashboard/interested' },
    { name: 'My Inquiries', icon: MessageCircle, to: '/dashboard/inquiries' },
    { name: 'My Viewings', icon: Calendar, to: '/dashboard/viewings' },
    { name: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  ];

  const closeMobile = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden p-2 rounded-lg bg-surface shadow-md text-text hover:bg-surface-hover transition-smooth"
        aria-label="Open dashboard menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-surface border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">Customer Dashboard</h2>
          <button
            onClick={closeMobile}
            className="lg:hidden p-1 text-muted hover:text-text"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-text hover:bg-surface-hover'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={closeMobile}
        />
      )}
    </>
  );
};

export default CustomerSidebar;
