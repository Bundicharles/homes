import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  return (
    <footer className="bg-text text-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src={settings.branding_dark_logo || '/logo-white.svg'} alt={businessName} className="h-8 w-auto mb-4" />
            <p className="text-sm mb-4">
              {settings.description || 'Your trusted partner in Kenyan real estate.'}
            </p>
            <div className="flex space-x-4">
              {settings.social_links?.map((link) => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                  {link.platform}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-smooth">Home</Link></li>
              <li><Link to="/properties" className="hover:text-primary transition-smooth">Properties</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">About</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-smooth">Services</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>Phone: {settings.contact_phone || 'N/A'}</li>
              <li>Email: {settings.contact_email || 'N/A'}</li>
              <li>Address: {settings.contact_address || 'N/A'}</li>
              <li>Hours: {settings.contact_opening_hours || 'Mon-Fri: 8AM-6PM'}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-primary transition-smooth">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-smooth">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary transition-smooth">Property Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <Link
            to="/admin"
            className="text-xs opacity-50 hover:opacity-100 transition-smooth"
            title="Admin Panel"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
