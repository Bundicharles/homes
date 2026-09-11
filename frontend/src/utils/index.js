export const formatPrice = (price, currency = 'KES') => {
  const numPrice = Number(price) || 0;
  if (currency === 'KES') {
    return 'KSh ' + numPrice.toLocaleString('en-KE');
  }
  return currency + ' ' + numPrice.toLocaleString();
};

export const formatPriceRaw = (price, currency = 'KES') => {
  const numPrice = Number(price) || 0;
  if (currency === 'KES') {
    return 'KES ' + numPrice.toLocaleString('en-KE');
  }
  return currency + ' ' + numPrice.toLocaleString();
};

export const formatNumber = (num) => {
  const value = Number(num);
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-KE');
};

export const truncateText = (text, maxLength) => {
  const value = text == null ? '' : String(text);
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
};

export const extractList = (response) => {
  if (Array.isArray(response)) return response;
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const extractTotal = (response, fallback = 0) => {
  const payload = response?.data;
  const total =
    payload?.pagination?.total ??
    payload?.total ??
    response?.pagination?.total ??
    fallback;
  return Number(total) || 0;
};

export const generateWhatsAppUrl = (phone, message) => {
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const generatePropertyWhatsAppMessage = (property) => {
  const message = `Hello, I am interested in:

Property: ${property.name}
Location: ${property.location}
Price: ${formatPrice(property.price, property.currency || 'KES')}

Website: ${window.location.origin}/properties/${property.slug}`;
  return generateWhatsAppUrl(property.whatsapp_number || '+254700000001', message);
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getInitials = (name) => {
  if (!name) return 'A';
  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Base URL for uploaded files (they live in backend/uploads).
// - TrueHost / root domain: /backend/
// - Local XAMPP subfolder: /homes/backend/
export const getUploadBase = () => {
  const isHomes = typeof window !== 'undefined' && window.location.pathname.startsWith('/homes');
  const envUpload = import.meta.env?.VITE_UPLOAD_BASE;
  let base;
  if (envUpload) {
    if (envUpload.startsWith('/homes') && !isHomes) {
      base = '/backend';
    } else {
      base = envUpload;
    }
  } else {
    base = isHomes ? '/homes/backend' : '/backend';
  }
  return base.endsWith('/') ? base : base + '/';
};

// Dist root where the built SPA lives (used for fallback static assets).
export const getAppBase = () => {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  if (path.startsWith('/homes/dist')) return '/homes/dist';
  if (path.startsWith('/homes')) return '/homes';
  return '';
};

// Rebase any uploads URL (however it was stored in DB) to the current env-correct path.
export const resolveAssetUrl = (url, fallback = '') => {
  if (!url) return fallback;
  if (/^https?:\/\/|^\/\//i.test(url) || /^data:|^blob:/i.test(url)) return url;

  let cleaned = String(url).trim().replace(/\\/g, '/');

  // If it's a frontend static asset (e.g. /logo.svg, /logo-white.svg, /homes/dist/logo.svg)
  const appBase = getAppBase();
  if (appBase && cleaned.startsWith(appBase)) {
    return cleaned;
  }
  if (/^\/?(logo|favicon|pwa|sw|apple-touch-icon)[^/]*$/i.test(cleaned)) {
    const asset = cleaned.replace(/^\/+/, '');
    return appBase ? `${appBase}/${asset}` : `/${asset}`;
  }

  // Strip leading slashes
  cleaned = cleaned.replace(/^\/+/, '');

  // Strip leading redundant URL/path segments:
  // e.g. "homes/backend/uploads/...", "backend/uploads/...", "uploads/..."
  cleaned = cleaned.replace(/^(?:homes\/)?backend\//i, '');
  cleaned = cleaned.replace(/^uploads\//i, '');

  const uploadBase = getUploadBase();
  return `${uploadBase}uploads/${cleaned}`;
};

// Format bytes up to Gigabytes
export const formatBytes = (bytes) => {
  const num = Number(bytes);
  if (!num || isNaN(num)) return '—';
  if (num < 1024) return `${num} B`;
  if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1073741824) return `${(num / 1048576).toFixed(1)} MB`;
  return `${(num / 1073741824).toFixed(2)} GB`;
};


