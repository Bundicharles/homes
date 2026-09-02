import { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
      { name: 'Add Property', to: '/admin/properties/add', permission: 'properties.create' },
      { name: 'Property Types', to: '/admin/properties/types', permission: 'property_types.view' },
      { name: 'Features', to: '/admin/properties/features', permission: 'features.view' },
      { name: 'Verification', to: '/admin/properties/verification', permission: 'verification.view' },
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
      { name: 'Contact', to: '/admin/contact', permission: 'settings.view' },
      { name: 'Social Media', to: '/admin/social', permission: 'settings.view' },
      { name: 'SEO', to: '/admin/seo', permission: 'seo.view' },
      { name: 'Security', to: '/admin/security', permission: 'settings.view' },
    ],
  },
  {
    name: 'Audit Logs',
    icon: 'ScrollText',
    to: '/admin/audit-logs',
    permission: 'audit_logs.view',
  },
];

const AdminSidebar = ({ collapsed = false, onToggle }) => {
  const [openSections, setOpenSections] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSection = (name) => {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const closeMobile = () => setMobileOpen(false);

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
        `}
        title={item.name}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {showCollapse && <span>{item.name}</span>}
      </NavLink>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {collapsed ? (
          <Link to="/admin" className="flex justify-center w-full">
            <Building className="w-6 h-6 text-primary" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-text">Admin Panel</h2>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="py-3 space-y-1 overflow-y-auto flex-1">
        {navigation.map((item) => renderNavItem(item))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden p-2 rounded-lg bg-surface shadow-md text-text hover:bg-surface-hover transition-smooth"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-surface border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={closeMobile}
        />
      )}
    </>
  );
};

export default AdminSidebar;
