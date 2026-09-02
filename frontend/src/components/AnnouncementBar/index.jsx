import { useSettings } from '@/context/SettingsContext';

const AnnouncementBar = () => {
  const { settings } = useSettings();

  const announcement = settings.announcement_bar_enabled === '1' || settings.announcement_bar_enabled === true;
  if (!announcement) return null;

  const message = settings.announcement_message || 'CALL US: +254 700 000 001 | WHATSAPP: +254 700 000 001 | EMAIL: info@realestate.co.ke | NAIROBI, KENYA';
  const speed = settings.announcement_speed || '30px';
  const direction = settings.announcement_direction || 'left';
  const bg = settings.announcement_bg || '#2563eb';
  const text = settings.announcement_text_color || '#ffffff';

  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: bg, color: text, fontSize: '0.875rem' }}>
      <div className="container mx-auto px-4">
        <marquee behavior="scroll" direction={direction === 'right' ? 'right' : 'left'} scrollamount="3" style={{ fontSize: '0.8125rem' }}>
          <span className="font-medium">
            {message}
          </span>
        </marquee>
      </div>
    </div>
  );
};

export default AnnouncementBar;
