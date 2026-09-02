import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const Unauthorized = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-text mb-3">Access Denied</h1>
        <p className="text-muted mb-8">
          You don't have permission to view this page. If you believe this is a mistake,
          please contact the administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/login" className="btn btn-outline inline-flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
        <p className="text-xs text-muted mt-8">{businessName}</p>
      </div>
    </div>
  );
};

export default Unauthorized;
