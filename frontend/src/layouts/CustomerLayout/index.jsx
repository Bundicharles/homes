import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '@/components/CustomerSidebar';
import CustomerTopbar from '@/components/CustomerTopbar';

const CustomerLayout = () => {
  // Mobile / tablet (<lg): the sidebar is an off-canvas drawer opened from the
  // topbar hamburger. Desktop (lg+): the sidebar manages its own collapse.
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <CustomerSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <CustomerTopbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
