export const setStoredAuth = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
};

export const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const clearStoredAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
  }
};

export const getStoredFavorites = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('guest_favorites');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const setStoredFavorites = (favorites) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guest_favorites', JSON.stringify(favorites));
  }
};

export const getStoredInterested = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('guest_interested');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const setStoredInterested = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guest_interested', JSON.stringify(items));
  }
};

export const getDismissedPromotions = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('dismissed_promotions');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const setDismissedPromotions = (ids) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dismissed_promotions', JSON.stringify(ids));
  }
};

export const getThemePreference = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme_preference') || 'light';
};

export const setThemePreference = (theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme_preference', theme);
  }
};
