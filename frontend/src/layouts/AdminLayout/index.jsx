import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PWAOfflineBanner, PWAUpdateNotification, PWAInstallModal } from '@/components/PWAInstallPrompt';

const AdminLayout = () => {
  // Desktop (lg+): collapsing the sidebar turns it into a compact icon rail,
  // and the dashboard reflows next to it (it is never overlapped).
  // Mobile / tablet (<lg): the sidebar becomes an off-canvas drawer. Both
  // states live here so the sidebar and the topbar hamburger stay in sync.
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onViewportChange={(isDesktop) => {
          setMobileOpen(false);
          if (!isDesktop) setSidebarCollapsed(false);
        }}
      />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <PWAOfflineBanner />
        <AdminTopbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-background">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <PWAUpdateNotification />
      <PWAInstallModal />
    </div>
  );
};

export default AdminLayout;
