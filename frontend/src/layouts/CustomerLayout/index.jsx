import { Outlet } from 'react-router-dom';
import CustomerSidebar from '@/components/CustomerSidebar';
import CustomerTopbar from '@/components/CustomerTopbar';

const CustomerLayout = () => {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomerTopbar />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
