import { useEffect, useState } from 'react';
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
  LogOut,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getAppBase, resolveAssetUrl } from '@/utils';

const CustomerSidebar = ({ mobileOpen = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const { settings } = useSettings();

  const businessName = settings?.business_name || 'Hemaprin Homes';
  const fallbackLogo = `${getAppBase()}/logo.svg`;
  const logoUrl =
    resolveAssetUrl(settings?.branding_logo || settings?.branding_dark_logo) || fallbackLogo;
  const collapsedLogoUrl =
    resolveAssetUrl(
      settings?.branding_favicon ||
      settings?.branding_mobile_logo ||
      settings?.branding_logo ||
      settings?.branding_dark_logo
    ) || fallbackLogo;

  const handleLogoError = (e) => {
    if (!e.currentTarget.src.endsWith('/logo.svg')) {
      e.currentTarget.src = fallbackLogo;
    }
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { name: 'Profile', icon: User, to: '/dashboard/profile' },
    { name: 'My Favorites', icon: Heart, to: '/dashboard/favorites' },
    { name: 'My Interested', icon: ShoppingCart, to: '/dashboard/interested' },
    { name: 'My Inquiries', icon: MessageCircle, to: '/dashboard/inquiries' },
    { name: 'My Viewings', icon: Calendar, to: '/dashboard/viewings' },
    { name: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  ];

  const closeMobile = () => onMobileClose?.();
  const showLabels = !collapsed;

  // Close the mobile drawer with the Escape key while it is open.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onMobileClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onMobileClose]);

  // When crossing the lg breakpoint: close the drawer on desktop and reset the
  // desktop collapse state on mobile so the drawer renders with full labels.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      onMobileClose?.();
      if (!event.matches) setCollapsed(false);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onMobileClose]);

  return (
    <>
      {/*
        Desktop (lg+): in-flow flex child — the dashboard reflows beside it and
        is never overlapped. Collapsing turns it into an icon rail (lg:w-20)
        with tooltips. Mobile / tablet (<lg): off-canvas drawer, opened from the
        topbar hamburger, closed via the X, the overlay or Esc.
      */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-surface border-r border-border shadow-xl lg:shadow-none transform transition-transform duration-300 lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 lg:transition-all lg:duration-300 lg:overflow-hidden ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border gap-2 min-w-0">
            {showLabels ? (
              <>
                <Link
                  to="/"
                  onClick={closeMobile}
                  className="flex items-center space-x-3 group min-w-0 flex-1"
                  title="Return to Website"
                >
                  <img
                    src={logoUrl}
                    alt={businessName}
                    className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
                    onError={handleLogoError}
                  />
                  <div className="min-w-0">
                    <span className="text-base font-extrabold text-primary tracking-tight truncate block">
                      {businessName}
                    </span>
                    <p className="text-xs text-muted truncate">Customer Portal</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setCollapsed(true)}
                    className="hidden lg:inline-block p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                    aria-label="Collapse menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closeMobile}
                    className="lg:hidden p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full">
                <Link
                  to="/"
                  onClick={closeMobile}
                  title={businessName}
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 hover:bg-surface-hover transition-colors"
                >
                  <img
                    src={collapsedLogoUrl}
                    alt={businessName}
                    className="w-9 h-9 object-contain"
                    onError={handleLogoError}
                  />
                </Link>
                <button
                  onClick={() => setCollapsed(false)}
                  className="hidden lg:inline-flex mx-auto p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                  aria-label="Expand menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <nav className="py-4 space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={closeMobile}
                  title={item.name}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:text-text hover:bg-surface-hover'
                  } ${showLabels ? '' : 'justify-center'}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {showLabels && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={logout}
              title="Sign Out"
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors ${
                showLabels ? '' : 'justify-center'
              }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {showLabels && (
                <span className="whitespace-nowrap">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default CustomerSidebar;
