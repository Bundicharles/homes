import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { getAppBase, resolveAssetUrl } from '@/utils';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  MessageCircle,
  Globe,
} from 'lucide-react';

const Footer = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const fallbackLogo = `${getAppBase()}/logo.svg`;
  const logoUrl =
    resolveAssetUrl(settings.branding_light_logo) ||
    resolveAssetUrl(settings.branding_logo) ||
    resolveAssetUrl(settings.branding_dark_logo) ||
    fallbackLogo;

  const handleLogoError = (e) => {
    if (!e.currentTarget.src.endsWith('/logo.svg')) {
      e.currentTarget.src = fallbackLogo;
    }
  };

  // Social icon mapping
  const getSocialIcon = (platform = '') => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook size={17} />;
    if (p.includes('instagram')) return <Instagram size={17} />;
    if (p.includes('twitter') || p === 'x') return <Twitter size={17} />;
    if (p.includes('linkedin')) return <Linkedin size={17} />;
    if (p.includes('youtube')) return <Youtube size={17} />;
    if (p.includes('whatsapp')) return <MessageCircle size={17} />;
    if (p.includes('telegram') || p.includes('tiktok')) return <Send size={17} />;
    return <Globe size={17} />;
  };

  const socialLinks = Array.isArray(settings.social_links)
    ? settings.social_links.filter((l) => l.is_active !== false && l.url)
    : [];

  const rawWhatsapp = settings.contact_whatsapp || '';
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');

  return (
    <footer className="bg-[#0f172a] text-slate-200 border-t border-slate-800 mt-auto selection:bg-primary/30 selection:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pb-16">
        {/* Main Grid: 12-column responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand, Mission & Socials (4 columns on desktop) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <img
                src={logoUrl}
                alt={businessName}
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                onError={handleLogoError}
              />
              <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-primary transition-colors duration-200">
                {businessName}
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.description ||
                'Your premier real estate partner in Kenya. Specializing in luxury residential properties, prime land investments, and bespoke property management.'}
            </p>

            {/* Regulatory badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <ShieldCheck size={14} className="text-success flex-shrink-0" />
              <span>Licensed &amp; Verified Agency</span>
            </div>

            {/* Social media icons */}
            {socialLinks.length > 0 ? (
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Connect With Us
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-primary hover:border-primary flex items-center justify-center transition-all duration-200 hover:scale-105"
                      aria-label={link.platform}
                      title={link.platform}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Column 2: Quick Links (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Properties</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/plots"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Plots &amp; Land</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Media Gallery</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Saved Homes</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Our Services</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support (3 columns on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Property Disclaimer</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-slate-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <ArrowRight size={12} className="text-primary" />
                  <span>Request a Viewing</span>
                </Link>
              </li>
            </ul>

            {/* Direct WhatsApp Action Box */}
            {cleanWhatsapp ? (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200 text-xs font-semibold"
                >
                  <MessageCircle size={15} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            ) : null}
          </div>

          {/* Column 4: Contact Info (3 columns on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-primary after:rounded-full">
              Get In Touch
            </h4>
            <ul className="space-y-3 text-sm">
              {settings.contact_address && (
                <li className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-primary flex-shrink-0 mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <span className="text-slate-300 text-sm leading-snug">
                    {settings.contact_address}
                  </span>
                </li>
              )}

              {settings.contact_phone && (
                <li className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-primary flex-shrink-0">
                    <Phone size={15} />
                  </div>
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              )}

              {settings.contact_email && (
                <li className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-primary flex-shrink-0">
                    <Mail size={15} />
                  </div>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-slate-300 hover:text-white text-sm transition-colors truncate"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}

              {settings.contact_opening_hours && (
                <li className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-primary flex-shrink-0">
                    <Clock size={15} />
                  </div>
                  <span className="text-slate-300 text-sm">
                    {settings.contact_opening_hours}
                  </span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Navigation */}
        <div className="border-t border-slate-800/80 mt-12 sm:mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <Link to="/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <Link
              to="/admin"
              className="opacity-50 hover:opacity-100 hover:text-white transition-opacity"
              title="Admin Portal"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
