import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, ShoppingBag, User, Search, Phone, MessageCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/services/api';
import { getAppBase, resolveAssetUrl } from '@/utils';
import { PWAInstallButton } from '@/components/PWAInstallPrompt';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { settings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fallbackLogo = `${getAppBase()}/logo.svg`;
  const logo = resolveAssetUrl(settings.branding_logo || settings.branding_dark_logo) || fallbackLogo;
  const mobileLogo = resolveAssetUrl(settings.branding_mobile_logo) || logo;
  const businessName = settings.business_name || 'Hemaprin Homes';

  const handleLogoError = (e) => {
    if (!e.currentTarget.src.endsWith('/logo.svg')) {
      e.currentTarget.src = fallbackLogo;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 sm:h-20 lg:h-22">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src={logo}
                alt={businessName}
                className="h-11 sm:h-12 lg:h-14 w-auto object-contain hidden sm:block transition-transform duration-200 group-hover:scale-105"
                onError={handleLogoError}
              />
              <img
                src={mobileLogo}
                alt={businessName}
                className="h-9 sm:h-10 w-auto object-contain sm:hidden"
                onError={handleLogoError}
              />
              <span className="text-xl lg:text-2xl font-extrabold text-primary tracking-tight hidden sm:block">{businessName}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink to="/" className="text-sm font-medium hover:text-primary transition-smooth">Home</NavLink>
            <NavLink to="/properties" className="text-sm font-medium hover:text-primary transition-smooth">Properties</NavLink>
            <NavLink to="/plots" className="text-sm font-medium hover:text-primary transition-smooth">Plots &amp; Land</NavLink>
            <NavLink to="/gallery" className="text-sm font-medium hover:text-primary transition-smooth">Gallery</NavLink>
            <NavLink to="/about" className="text-sm font-medium hover:text-primary transition-smooth">About</NavLink>
            <NavLink to="/services" className="text-sm font-medium hover:text-primary transition-smooth">Services</NavLink>
            <NavLink to="/contact" className="text-sm font-medium hover:text-primary transition-smooth">Contact</NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted hover:text-primary transition-smooth"
              aria-label="Search properties"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/favorites" className="relative p-2 text-muted hover:text-primary transition-smooth">
              <Heart className="w-5 h-5" />
            </Link>

            <Link to="/interested-properties" className="relative p-2 text-muted hover:text-primary transition-smooth">
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <a
              href={settings.contact_whatsapp ? `https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-smooth"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">WhatsApp</span>
            </a>

            <PWAInstallButton className="hidden md:inline-flex" />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface transition-smooth"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <img
                    src={resolveAssetUrl(user?.profile_image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-text truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-text hover:bg-surface-hover">Dashboard</Link>
                    <Link to="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-text hover:bg-surface-hover">Profile</Link>
                    <Link to="/dashboard/inquiries" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-text hover:bg-surface-hover">My Inquiries</Link>
                    <Link to="/dashboard/notifications" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-text hover:bg-surface-hover">Notifications</Link>
                    <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-text hover:bg-surface-hover">Favorites</Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 border-t border-border mt-1"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-smooth"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-muted hover:text-primary transition-smooth"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 max-w-sm bg-surface shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <img
              src={mobileLogo}
              alt={businessName}
              className="h-10 w-auto object-contain"
              onError={handleLogoError}
            />
            <span className="text-lg font-bold text-primary">{businessName}</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-muted hover:text-primary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="py-4 space-y-2">
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Home</NavLink>
          <NavLink to="/properties" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Properties</NavLink>
          <NavLink to="/plots" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Plots &amp; Land</NavLink>
          <NavLink to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Gallery</NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">About</NavLink>
          <NavLink to="/services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Services</NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Contact</NavLink>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Dashboard</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium hover:bg-surface-hover rounded-lg">Login</Link>
          )}

          <div className="pt-2 px-2 border-t border-border">
            <PWAInstallButton variant="mobile-nav" label="Install Mobile App" />
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Search Modal */}
      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </header>
  );
};

const SearchModal = ({ onClose }) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/properties?keyword=${encodeURIComponent(keyword.trim())}`);
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Search Properties</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Location, property type, or keyword..."
              className="flex-1 input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="p-4 border-t border-border bg-background rounded-b-xl">
          <button onClick={onClose} className="btn btn-ghost w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
