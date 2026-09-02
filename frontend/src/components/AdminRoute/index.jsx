import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSkeleton } from '@/components/Modal';

const STAFF_ROLES = [
  'super-admin',
  'administrator',
  'property-manager',
  'content-manager',
  'agent',
  'accountant',
];

const AdminRoute = ({ allowedRoles = STAFF_ROLES, redirectPath = '/login' }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton count={5} type="card" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: '/admin' }} replace />;
  }

  if (allowedRoles && (!user?.role_slug || !allowedRoles.includes(user.role_slug))) {
    return <Navigate to={user?.role_slug === 'customer' ? '/dashboard' : '/login'} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
