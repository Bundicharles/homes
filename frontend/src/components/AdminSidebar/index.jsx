import { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Star,
  MessageCircle,
  Calendar,
  Users,
  UserCheck,
  Megaphone,
  Image,
  FileText,
  Menu,
  ChevronDown,
  ChevronRight,
  Settings,
  ScrollText,
  BarChart3,
  UserCog,
  HelpCircle,
  Plus,
  Home,
  Tags,
  ShieldCheck,
  ClipboardList,
  Globe,
  Palette,
  Brush,
  Smartphone,
  Search,
  Shield,
  Activity,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getAppBase, resolveAssetUrl } from '@/utils';
import { PWAInstallButton } from '@/components/PWAInstallPrompt';

const iconMap = {
  LayoutDashboard,
  Building,
  Plus,
  Home,
  Tags,
  Star,
  ShieldCheck,
  ClipboardList,
  MessageCircle,
  Calendar,
  Users,
  UserCheck,
  Megaphone,
  Image,
  FileText,
  Menu,
  Settings,
  Globe,
  Palette,
  Brush,
  Smartphone,
  Search,
  Shield,
  ScrollText,
  BarChart3,
  UserCog,
  Activity,
  HelpCircle,
  LogOut,
};

const navigation = [
  {
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    to: '/admin',
    permission: 'dashboard',
  },
  {
    name: 'Properties',
    icon: 'Building',
    permission: 'properties',
    children: [
      { name: 'All Properties', to: '/admin/properties', permission: 'properties.view' },
      { name: 'Plots & Land', to: '/admin/plots', permission: 'properties.view' },
      { name: 'Add Property', to: '/admin/properties/add', permission: 'properties.create' },
      { name: 'Property Types', to: '/admin/properties/types', permission: 'property_types.view' },
      { name: 'Features', to: '/admin/properties/features', permission: 'features.view' },
    ],
  },
  {
    name: 'Messages',
    icon: 'MessageCircle',
    to: '/admin/messages',
    permission: 'messages.view',
  },
  {
    name: 'Viewing Requests',
    icon: 'Calendar',
    to: '/admin/viewing-requests',
    permission: 'viewings.view',
  },
  {
    name: 'Customers',
    icon: 'Users',
    to: '/admin/customers',
    permission: 'customers.view',
  },
  {
    name: 'Agents',
    icon: 'UserCheck',
    to: '/admin/agents',
    permission: 'agents.view',
  },
  {
    name: 'Promotions',
    icon: 'Megaphone',
    to: '/admin/promotions',
    permission: 'promotions.view',
  },
  {
    name: 'Media',
    icon: 'Image',
    to: '/admin/media',
    permission: 'media.view',
  },
  {
    name: 'Pages',
    icon: 'FileText',
    to: '/admin/pages',
    permission: 'pages.view',
  },
  {
    name: 'Menus',
    icon: 'Menu',
    to: '/admin/menus',
    permission: 'menus.view',
  },
  {
    name: 'Testimonials',
    icon: 'Star',
    to: '/admin/testimonials',
    permission: 'testimonials.view',
  },
  {
    name: 'FAQs',
    icon: 'HelpCircle',
    to: '/admin/faqs',
    permission: 'faqs.view',
  },
  {
    name: 'Analytics',
    icon: 'BarChart3',
    to: '/admin/analytics',
    permission: 'analytics.view',
  },
  {
    name: 'Users & Roles',
    icon: 'UserCog',
    permission: 'users.view',
    children: [
      { name: 'Users', to: '/admin/users', permission: 'users.view' },
      { name: 'Roles', to: '/admin/roles', permission: 'roles.view' },
    ],
  },
  {
    name: 'Settings',
    icon: 'Settings',
    permission: 'settings.view',
    children: [
      { name: 'General', to: '/admin/settings', permission: 'settings.view' },
      { name: 'Branding', to: '/admin/branding', permission: 'settings.view' },
      { name: 'Typography', to: '/admin/fonts', permission: 'settings.view' },
      { name: 'Colors', to: '/admin/colors', permission: 'settings.view' },
      { name: 'Contact', to: '/admin/contact', permission: 'settings.view' },
      { name: 'Social Media', to: '/admin/social', permission: 'settings.view' },
      { name: 'SEO', to: '/admin/seo', permission: 'seo.view' },
      { name: 'Security', to: '/admin/security', permission: 'settings.view' },
      { name: 'EARB Info', to: '/admin/earb', permission: 'settings.view' },
    ],
  },
  {
    name: 'Audit Logs',
    icon: 'ScrollText',
    to: '/admin/audit-logs',
    permission: 'audit_logs.view',
  },
];

const AdminSidebar = ({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
  onViewportChange,
}) => {
  const [openSections, setOpenSections] = useState({});
  const location = useLocation();
  const { logout } = useAuth();
  const { settings } = useSettings();

  const businessName = settings?.business_name || 'Hemaprin Homes';
  const fallbackLogo = `${getAppBase()}/logo.svg`;
  const logoUrl = resolveAssetUrl(settings?.branding_logo || settings?.branding_dark_logo) || fallbackLogo;
  const collapsedLogoUrl = resolveAssetUrl(settings?.branding_favicon || settings?.branding_mobile_logo || settings?.branding_logo || settings?.branding_dark_logo) || fallbackLogo;

  const handleLogoError = (e) => {
    if (!e.currentTarget.src.endsWith('/logo.svg')) {
      e.currentTarget.src = fallbackLogo;
    }
  };

  const toggleSection = (name) => {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const closeMobile = () => onMobileClose?.();

  // Close the mobile drawer with the Escape key while it is open.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onMobileClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onMobileClose]);

  // When crossing the lg breakpoint: close the drawer on desktop, and reset
  // the desktop collapse state on mobile so the drawer always renders with
  // full labels.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      onMobileClose?.();
      if (onViewportChange) onViewportChange(event.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onMobileClose, onViewportChange]);

  const isActivePath = (to) => {
    if (to === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(to);
  };

  const renderNavItem = (item, isChild = false) => {
    const Icon = iconMap[item.icon] || Menu;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections[item.name];
    const isActive = item.to ? isActivePath(item.to) : false;
    const showCollapse = !collapsed || isChild;

    if (hasChildren) {
      const anyChildActive = item.children.some((child) => isActivePath(child.to));
      const sectionOpen = isOpen || anyChildActive;

      // Desktop icon rail: collapsed sections link to their first child.
      if (!showCollapse) {
        return (
          <NavLink
            key={item.name}
            to={item.children[0].to}
            title={item.name}
            className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
              anyChildActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
          </NavLink>
        );
      }

      return (
        <div key={item.name}>
          <button
            type="button"
            onClick={() => showCollapse && toggleSection(item.name)}
            disabled={!showCollapse}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
              ${anyChildActive || isOpen ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text hover:bg-surface-hover'}
              ${!showCollapse ? 'justify-center' : ''}
            `}
            aria-expanded={sectionOpen}
            title={item.name}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {showCollapse && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {sectionOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>
          {showCollapse && sectionOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.name}
                  to={child.to}
                  onClick={closeMobile}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActivePath(child.to)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted hover:text-text hover:bg-surface-hover'}
                  `}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <span>{child.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.to}
        onClick={closeMobile}
        className={`
          flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
          ${isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted hover:text-text hover:bg-surface-hover'}
          ${!showCollapse ? 'justify-center' : ''}
        `}
        title={item.name}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {showCollapse && <span className="whitespace-nowrap">{item.name}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border gap-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <Link
              to="/admin"
              onClick={closeMobile}
              title="Admin Panel"
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 hover:bg-surface-hover transition-colors"
            >
              <img
                src={collapsedLogoUrl}
                alt={businessName}
                className="w-10 h-10 object-contain"
                onError={handleLogoError}
              />
            </Link>
            {onToggle && (
              <button
                onClick={onToggle}
                className="hidden lg:inline-flex p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                aria-label="Expand sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/admin"
              onClick={closeMobile}
              className="flex items-center space-x-3 group min-w-0"
            >
              <img
                src={logoUrl}
                alt={businessName}
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
                onError={handleLogoError}
              />
              <span className="text-xl font-extrabold text-primary tracking-tight truncate">
                {businessName}
              </span>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="hidden lg:inline-block p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {onMobileClose && (
                <button
                  onClick={closeMobile}
                  className="lg:hidden p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <nav className="py-3 space-y-1 overflow-y-auto overflow-x-hidden flex-1">
        {navigation.map((item) => renderNavItem(item))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <PWAInstallButton variant="sidebar" collapsed={collapsed} />
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/*
        Desktop (lg+): the sidebar is an in-flow flex child of AdminLayout, so
        the dashboard always reflows beside it and is never overlapped.
        Collapsing turns it into a compact icon rail (lg:w-20) with tooltips.
        Mobile / tablet (<lg): off-canvas drawer over the page with an overlay,
        opened from the topbar hamburger, closed via the X, the overlay or Esc.
      */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-surface border-r border-border shadow-xl lg:shadow-none transform transition-transform duration-300 lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 lg:transition-all lg:duration-300 lg:overflow-hidden ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full w-full flex-col">{sidebarContent}</div>
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

export default AdminSidebar;
