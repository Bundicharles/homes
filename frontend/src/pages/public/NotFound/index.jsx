import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  useEffect(() => {
    document.title = `404 - Page Not Found | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'The page you are looking for does not exist. Return to the homepage.');
    }
  }, [businessName]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-8xl lg:text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-4">Page Not Found</h2>
          <p className="text-muted max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back to safety.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
          <Link to="/properties" className="btn btn-outline">
            <Search className="w-4 h-4 mr-2" />
            Browse Properties
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-muted">
          <p>Looking for something specific?</p>
          <p className="mt-1">Contact us at {settings.contact_email || 'info@realestate.co.ke'}</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
