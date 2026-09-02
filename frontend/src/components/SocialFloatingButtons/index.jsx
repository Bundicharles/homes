import { Facebook, Instagram, Youtube, Linkedin, Twitter, Send, MessageCircle, Phone } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const FloatingSocialButtons = () => {
  const { settings } = useSettings();
  const whatsAppEnabled = settings.whatsapp_enabled === '1' || settings.whatsapp_enabled === true;
  const floatingSocial = settings.floating_social === '1' || settings.floating_social === true;

  if (!floatingSocial) return null;

  const socialLinks = settings.social_links || [];
  const whatsappLink = socialLinks.find((l) => l.platform.toLowerCase() === 'whatsapp');
  const whatsappNumber = whatsappLink?.url?.replace('https://wa.me/', '') || settings.contact_whatsapp;

  const getIcon = (platform) => {
    const icons = {
      facebook: <Facebook size={20} />,
      instagram: <Instagram size={20} />,
      tiktok: <Send size={20} />,
      youtube: <Youtube size={20} />,
      linkedin: <Linkedin size={20} />,
      x: <Twitter size={20} />,
      telegram: <Send size={20} />,
      whatsapp: <MessageCircle size={20} />,
    };
    return icons[platform.toLowerCase()] || <Send size={20} />;
  };

  const visibleLinks = socialLinks.filter(l => l.is_active);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {visibleLinks.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          title={link.platform}
        >
          {getIcon(link.platform)}
        </a>
      ))}

      {whatsAppEnabled && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 bg-success text-white"
          title="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      )}
    </div>
  );
};

export default FloatingSocialButtons;
