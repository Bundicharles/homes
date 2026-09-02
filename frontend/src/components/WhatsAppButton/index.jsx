import { MessageCircle } from 'lucide-react';
import { generateWhatsAppUrl } from '@/utils';
import { useSettings } from '@/context/SettingsContext';

const WhatsAppButton = ({ property, message, className = '' }) => {
  const { settings } = useSettings();
  const whatsappNumber = property?.whatsapp_number || settings.contact_whatsapp || '+254700000001';

  const defaultMessage = message || (property
    ? `Hello, I am interested in:\n\nProperty: ${property.name}\nLocation: ${property.location}\nPrice: ${property.currency || 'KES'} ${Number(property.price || 0).toLocaleString()}\n\nWebsite: ${window.location.origin}/properties/${property.slug}`
    : 'Hello, I am interested in your properties. Please provide more information.');

  const whatsappUrl = generateWhatsAppUrl(whatsappNumber, defaultMessage);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-success text-white px-4 py-2.5 text-sm font-medium transition-transform hover:scale-105 ${className}`}
      aria-label="Contact via WhatsApp"
    >
      <MessageCircle size={18} />
      WhatsApp
    </a>
  );
};

export default WhatsAppButton;
