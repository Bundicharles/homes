import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsAPI } from '@/services/api';
import { getDismissedPromotions, setDismissedPromotions } from '@/utils/authStorage';
import { X } from 'lucide-react';

const PromotionCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsAPI.getAll(),
    refetchInterval: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const promotions = data?.success ? data.data : [];
  const dismissed = getDismissedPromotions();

  const visiblePromotions = promotions.filter((promo) => {
    if (!promo.active) return false;

    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) return false;
    if (promo.end_date && new Date(promo.end_date) < now) return false;

    if (promo.display_frequency === 'once_per_session' && sessionStorage.getItem(`promo_shown_${promo.id}`)) {
      return false;
    }
    if (promo.display_frequency === 'once_per_day' && localStorage.getItem(`promo_shown_${promo.id}`) === new Date().toDateString()) {
      return false;
    }
    if (dismissed.includes(promo.id)) return false;

    return true;
  });

  const handleDismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissedPromotions(newDismissed);
    queryClient.invalidateQueries({ queryKey: ['promotions'] });
  };

  const handleView = (promo) => {
    promotionsAPI.getView(promo.id).catch(() => {});
    if (promo.display_frequency === 'once_per_session') {
      sessionStorage.setItem(`promo_shown_${promo.id}`, '1');
    }
  };

  const handleCloseAll = () => {
    const allIds = visiblePromotions.map((p) => p.id);
    setDismissedPromotions([...dismissed, ...allIds]);
    queryClient.invalidateQueries({ queryKey: ['promotions'] });
  };

  if (isLoading || visiblePromotions.length === 0) return null;

  const topBanner = visiblePromotions.filter((p) => p.display_type === 'banner' || p.display_type === 'top');
  const cornerCards = visiblePromotions.filter((p) => p.display_type === 'corner' || p.display_type === 'card');
  const popups = visiblePromotions.filter((p) => p.display_type === 'popup' || p.display_type === 'modal');

  return (
    <>
      {topBanner.length > 0 && (
        <div className="relative bg-primary text-white px-4 py-3 overflow-hidden">
          <div className="container mx-auto flex items-center justify-between">
            {topBanner.map((promo) => (
              <div key={promo.id} className="flex items-center gap-4">
                {promo.image && (
                  <img src={promo.image} alt={promo.title} className="h-12 w-12 object-contain rounded" loading="lazy" />
                )}
                <div>
                  <span className="font-semibold">{promo.title}:</span>
                  <span className="ml-2">{promo.description}</span>
                </div>
                {promo.button_text && promo.button_url && (
                  <a
                    href={promo.button_url}
                    onClick={() => handleView(promo)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    {promo.button_text}
                  </a>
                )}
              </div>
            ))}

            <button
              onClick={handleCloseAll}
              className="text-white/80 hover:text-white ml-auto pl-4"
              aria-label="Dismiss promotion"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {cornerCards.length > 0 && (
        <div className="fixed bottom-24 right-6 z-30 space-y-4">
          {cornerCards.map((promo) => (
            <div key={promo.id} className="card w-72 shadow-xl border border-border relative">
              {promo.image && (
                <img src={promo.image} alt={promo.title} className="w-full h-32 object-contain rounded-t-xl" loading="lazy" />
              )}
              <div className="p-4" style={{ backgroundColor: promo.background_color }}>
                <h4 className="font-bold text-lg" style={{ color: promo.text_color }}>{promo.title}</h4>
                <p className="text-sm mt-1" style={{ color: promo.text_color }}>{promo.description?.substring(0, 100)}...</p>
                {promo.button_text && promo.button_url && (
                  <a
                    href={promo.button_url}
                    onClick={() => { handleView(promo); handleDismiss(promo.id); }}
                    className="block mt-3 text-center bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    {promo.button_text}
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDismiss(promo.id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {popups.length > 0 && popups.map((promo) => (
        <Modal key={promo.id} isOpen={true} onClose={() => handleDismiss(promo.id)} title={promo.title} maxWidth="md">
          {promo.image && (
            <img src={promo.image} alt={promo.title} className="w-full h-48 object-contain rounded-lg" loading="lazy" />
          )}
          <p className="mt-4 text-muted">{promo.description}</p>
          {promo.button_text && promo.button_url && (
            <a
              href={promo.button_url}
              onClick={() => { handleView(promo); handleDismiss(promo.id); }}
              className="inline-block mt-4 btn btn-primary"
            >
              {promo.button_text}
            </a>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleDismiss(promo.id)}
              className="btn btn-ghost"
            >
              No thanks
            </button>
          </div>
        </Modal>
      ))}
    </>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'lg' }) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth] || 'max-w-lg';

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-surface rounded-xl shadow-2xl w-full ${maxWidthClass}`}>
        <div className="p-6">
          {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
