import { X, Loader2 } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'lg', showClose = true }) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-[90vw]',
  }[maxWidth] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={['bg-surface rounded-xl shadow-2xl w-full', maxWidthClass, 'max-h-[90vh]', 'overflow-y-auto'].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        {title && <div className="p-6 pb-4"><h3 className="text-xl font-bold">{title}</h3></div>}
        <div className={['px-6', title ? 'pb-6' : 'p-6'].join(' ')}>{children}</div>
      </div>
    </div>
  );
};

export const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  return null;
};

export const LoadingSkeleton = ({ count = 4, type = 'card' }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'property-card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skeletons.map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-video bg-muted/20 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted/20 rounded w-3/4" />
              <div className="h-4 bg-muted/20 rounded w-1/2" />
              <div className="h-6 bg-muted/20 rounded w-1/4" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-4 bg-muted/20 rounded" />
                <div className="h-4 bg-muted/20 rounded" />
                <div className="h-4 bg-muted/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {skeletons.map((_, i) => (
          <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skeletons.map((_, i) => (
        <div key={i} className="h-4 bg-muted/20 rounded animate-pulse" />
      ))}
    </div>
  );
};

export const EmptyState = ({ message = 'No data available', type = 'default', action }) => {
  const icons = {
    search: (
      <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    favorite: (
      <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318A4.5 4.5 0 0112 4.5a4.5 4.5 0 013.682 7.318L12 16.5l-3.682-2.818A4.5 4.5 0 014.318 6.318z" />
      </svg>
    ),
    default: (
      <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2h-1.5a2 2 0 01-2-2V3a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 01-2 2H5a2 2 0 00-2 2v3a2 2 0 002 2h2m-2 4h10a2 2 0 012 2v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1a2 2 0 012-2z" />
      </svg>
    ),
  };

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{icons[type] || icons.default}</div>
      <p className="text-muted mb-4">{message}</p>
      {action && action}
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        Previous
      </button>

      {start > 1 && <span className="px-1">...</span>}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={[
            'px-3 py-1 rounded-lg border transition-colors',
            page === currentPage ? 'bg-primary text-white border-primary' : 'border-border hover:bg-surface',
          ].join(' ')}
          aria-label={'Page ' + page}
        >
          {page}
        </button>
      ))}

      {end < totalPages && <span className="px-1">...</span>}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded-lg border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};
