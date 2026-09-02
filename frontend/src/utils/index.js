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
  return num.toLocaleString('en-KE');
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
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
  const date = new Date(dateString);
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
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
