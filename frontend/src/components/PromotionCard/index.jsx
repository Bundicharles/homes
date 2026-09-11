import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsAPI } from '@/services/api';
import { getDismissedPromotions, setDismissedPromotions } from '@/utils/authStorage';
import { resolveAssetUrl } from '@/utils';
import { X, Tag, ExternalLink, Megaphone } from 'lucide-react';

const PromotionCard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsAPI.getAll(),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const promotions = data?.success && Array.isArray(data.data) ? data.data : [];
  const dismissed = getDismissedPromotions();

  const visiblePromotions = promotions.filter((promo) => {
    if (!promo.active) return false;

    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) return false;
    if (promo.end_date && new Date(promo.end_date) < now) return false;

    // Check frequency rules
    if (
      promo.display_frequency === 'once_per_session' &&
      sessionStorage.getItem(`promo_shown_${promo.id}`)
    ) {
      return false;
    }
    if (
      promo.display_frequency === 'once_per_day' &&
      localStorage.getItem(`promo_shown_${promo.id}`) === new Date().toDateString()
    ) {
      return false;
    }
    if (dismissed.includes(promo.id)) return false;

    // Check page visibility filtering
    if (
      promo.page_visibility &&
      Array.isArray(promo.page_visibility) &&
      promo.page_visibility.length > 0
    ) {
      const path = location.pathname;
      const isVisible = promo.page_visibility.some((page) => {
        if (!page || page === 'all') return true;
        if (page === 'home' && (path === '/' || path === '')) return true;
        if (page === 'properties' && path.startsWith('/properties')) return true;
        if (page === 'about' && path.startsWith('/about')) return true;
        if (page === 'services' && path.startsWith('/services')) return true;
        if (page === 'contact' && path.startsWith('/contact')) return true;
        return path.includes(page);
      });
      if (!isVisible) return false;
    }

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
    if (promo.display_frequency === 'once_per_day') {
      localStorage.setItem(`promo_shown_${promo.id}`, new Date().toDateString());
    }
  };

  const handleClick = (promo) => {
    handleView(promo);
    promotionsAPI.getClick(promo.id).catch(() => {});
  };

  if (isLoading || visiblePromotions.length === 0) return null;

  const topBanner = visiblePromotions.filter(
    (p) => p.display_type === 'banner' || p.display_type === 'top' || p.display_type === 'inline'
  );
  const cornerCards = visiblePromotions.filter(
    (p) => p.display_type === 'corner' || p.display_type === 'card'
  );
  const popups = visiblePromotions.filter(
    (p) => p.display_type === 'popup' || p.display_type === 'modal'
  );
  const footerPromos = visiblePromotions.filter((p) => p.display_type === 'footer');

  return (
    <>
      {/* 1. TOP BANNER - FULL EDGE-TO-EDGE HERO BANNER */}
      {topBanner.length > 0 && (
        <div className="relative z-30 shadow-md overflow-hidden">
          {topBanner.map((promo) => {
            const hasImage = Boolean(promo.image);
            const bg = promo.background_color || 'var(--color-primary, #2563eb)';
            const fg = promo.text_color || '#ffffff';

            if (hasImage) {
              return (
                <div
                  key={promo.id}
                  className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden group"
                  style={{ backgroundColor: bg }}
                >
                  {/* Full edge-to-edge image */}
                  <img
                    src={resolveAssetUrl(promo.image)}
                    alt={promo.title}
                    className="w-full h-full object-cover object-center block transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center p-6 sm:p-10 md:p-14">
                    <div className="max-w-xl text-white">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
                        <Tag size={12} /> Special Offer
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">
                        {promo.title}
                      </h2>
                      {promo.description && (
                        <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-lg mb-5 drop-shadow">
                          {promo.description}
                        </p>
                      )}
                      {promo.button_text && promo.button_url && (
                        <a
                          href={promo.button_url}
                          onClick={() => handleClick(promo)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:translate-y-[-1px]"
                        >
                          <span>{promo.button_text}</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Close button */}
                  {promo.close_button !== false && (
                    <button
                      onClick={() => handleDismiss(promo.id)}
                      className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
                      aria-label="Dismiss promotion"
                      title="Dismiss"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              );
            }

            // Fallback for banner without image
            return (
              <div
                key={promo.id}
                className="px-4 py-3 transition-all duration-300 relative"
                style={{ backgroundColor: bg, color: fg }}
              >
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 inline-flex items-center justify-center p-1.5 rounded-md bg-white/20">
                      <Megaphone size={16} />
                    </span>
                    <div className="truncate">
                      <span className="font-bold mr-2">{promo.title}:</span>
                      <span className="opacity-95">{promo.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    {promo.button_text && promo.button_url && (
                      <a
                        href={promo.button_url}
                        onClick={() => handleClick(promo)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-current transition-colors shadow-sm"
                      >
                        <span>{promo.button_text}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {promo.close_button !== false && (
                      <button
                        onClick={() => handleDismiss(promo.id)}
                        className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
                        aria-label="Dismiss promotion"
                        title="Dismiss"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. FLOATING CORNER CARD - FULL EDGE-TO-EDGE DOMINANT IMAGE */}
      {cornerCards.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 space-y-4 max-w-xs sm:max-w-sm w-full pointer-events-none">
          {cornerCards.map((promo) => {
            const bg = promo.background_color || 'var(--color-surface, #ffffff)';
            const fg = promo.text_color || 'var(--color-text, #1e293b)';
            return (
              <div
                key={promo.id}
                className="pointer-events-auto rounded-2xl shadow-2xl border border-border overflow-hidden relative transition-all duration-300 transform hover:scale-[1.02] flex flex-col"
                style={{ backgroundColor: bg, color: fg }}
              >
                {/* Full edge-to-edge card image */}
                {promo.image && (
                  <div className="relative w-full h-52 sm:h-60 bg-surface-hover overflow-hidden flex-shrink-0">
                    <img
                      src={resolveAssetUrl(promo.image)}
                      alt={promo.title}
                      className="w-full h-full object-cover object-center block transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {promo.close_button !== false && (
                      <button
                        onClick={() => handleDismiss(promo.id)}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors shadow-md backdrop-blur-sm"
                        aria-label="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-base leading-snug">{promo.title}</h4>
                    {!promo.image && promo.close_button !== false && (
                      <button
                        onClick={() => handleDismiss(promo.id)}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors text-muted hover:text-text flex-shrink-0"
                        aria-label="Dismiss"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {promo.description && (
                    <p className="text-xs opacity-90 mt-2 leading-relaxed line-clamp-3">
                      {promo.description}
                    </p>
                  )}
                  {promo.button_text && promo.button_url && (
                    <a
                      href={promo.button_url}
                      onClick={() => {
                        handleClick(promo);
                        handleDismiss(promo.id);
                      }}
                      className="mt-4 block text-center bg-primary text-white hover:bg-primary-hover px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-md"
                    >
                      {promo.button_text}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. CENTER POPUP / MODAL - FULL EDGE-TO-EDGE HERO IMAGE */}
      {popups.length > 0 &&
        popups.map((promo) => (
          <div
            key={promo.id}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          >
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg border border-border overflow-hidden relative animate-scaleUp flex flex-col">
              {promo.close_button !== false && (
                <button
                  onClick={() => handleDismiss(promo.id)}
                  className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm shadow-md"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              )}
              {/* Full edge-to-edge modal hero image */}
              {promo.image && (
                <div className="relative w-full h-60 sm:h-72 bg-surface-hover overflow-hidden flex-shrink-0">
                  <img
                    src={resolveAssetUrl(promo.image)}
                    alt={promo.title}
                    className="w-full h-full object-cover object-center block"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div className="p-6 sm:p-8 text-center">
                <h3 className="text-2xl font-bold text-text mb-2.5">{promo.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-6 max-w-md mx-auto">
                  {promo.description}
                </p>
                <div className="flex flex-col gap-3">
                  {promo.button_text && promo.button_url && (
                    <a
                      href={promo.button_url}
                      onClick={() => {
                        handleClick(promo);
                        handleDismiss(promo.id);
                      }}
                      className="btn btn-primary w-full py-3 text-sm font-semibold justify-center rounded-xl shadow-lg"
                    >
                      {promo.button_text}
                    </a>
                  )}
                  <button
                    onClick={() => handleDismiss(promo.id)}
                    className="text-xs text-muted hover:text-text py-1.5 transition-colors"
                  >
                    No thanks, continue browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* 4. STICKY FOOTER PROMOTION BAR */}
      {footerPromos.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur text-white border-t border-slate-700 py-3.5 px-4 shadow-2xl">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
            {footerPromos.map((promo) => (
              <div key={promo.id} className="flex items-center gap-3 flex-1 min-w-0">
                <Tag size={18} className="text-primary flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold mr-2 text-white">{promo.title}</span>
                  <span className="text-slate-300 text-xs hidden sm:inline">
                    {promo.description}
                  </span>
                </div>
                {promo.button_text && promo.button_url && (
                  <a
                    href={promo.button_url}
                    onClick={() => handleClick(promo)}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors flex-shrink-0 shadow-md"
                  >
                    <span>{promo.button_text}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                {promo.close_button !== false && (
                  <button
                    onClick={() => handleDismiss(promo.id)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors ml-2"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PromotionCard;
