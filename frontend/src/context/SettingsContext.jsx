import { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '@/services/api';
import { getAppBase, resolveAssetUrl } from '@/utils';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['settings.public'],
    queryFn: () => settingsAPI.getPublic(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const settings =
    data?.success && data.data && typeof data.data === 'object' && !Array.isArray(data.data)
      ? data.data
      : {};

  useEffect(() => {
    if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) return;

    const root = document.documentElement;

    // Apply Brand Colors
    if (settings.branding_primary_color) {
      root.style.setProperty('--color-primary', settings.branding_primary_color);
      root.style.setProperty('--color-primary-hover', settings.branding_primary_color);
    }
    if (settings.branding_secondary_color) {
      root.style.setProperty('--color-secondary', settings.branding_secondary_color);
    }
    if (settings.branding_accent_color) {
      root.style.setProperty('--color-accent', settings.branding_accent_color);
    }
    if (settings.branding_background) {
      root.style.setProperty('--color-background', settings.branding_background);
    }
    if (settings.branding_surface) {
      root.style.setProperty('--color-surface', settings.branding_surface);
    }
    if (settings.branding_text_color) {
      root.style.setProperty('--color-text', settings.branding_text_color);
    }
    if (settings.branding_muted_text) {
      root.style.setProperty('--color-muted', settings.branding_muted_text);
    }

    // Apply Brand Fonts
    if (settings.branding_heading_font) {
      root.style.setProperty('--font-heading', `"${settings.branding_heading_font}", sans-serif`);
    }
    if (settings.branding_body_font) {
      root.style.setProperty('--font-body', `"${settings.branding_body_font}", sans-serif`);
    }

    // Apply Dynamic Favicon
    const favicon = settings.branding_favicon || settings.seo_favicon;
    if (favicon) {
      const faviconUrl = resolveAssetUrl(favicon) || `${getAppBase()}/favicon.svg`;
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [settings]);

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ['settings.public'] });
    queryClient.invalidateQueries({ queryKey: ['admin.settings'] });
    return refetch();
  };

  const value = {
    settings,
    isLoading,
    refetch: refreshSettings,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
