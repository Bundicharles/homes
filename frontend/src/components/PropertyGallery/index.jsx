import { getUploadBase } from '@/utils';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyGallery = ({ images, propertyName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const baseUrl = getUploadBase();

  const allImages = images && images.length > 0
    ? images.map((img) => {
        let filename = img.filename;
        if (!filename.startsWith('http')) {
          const cleaned = filename.replace(/^(\/?backend)?\/?uploads\//i, '');
          const finalPath = cleaned.startsWith('properties/') ? cleaned : `properties/${cleaned}`;
          filename = `${baseUrl}uploads/${finalPath}`;
        }
        return {
          src: filename,
          alt: img.alt_text || propertyName,
          caption: img.caption,
        };
      })
    : [{ src: 'https://placehold.co/800x600?text=No+Image', alt: 'No image available' }];

  const handlePrev = () => {
    setCurrentImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen, currentImage]);

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-hover shadow-card"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={allImages[currentImage].src}
            alt={allImages[currentImage].alt}
            className="w-full h-full object-cover object-center cursor-zoom-in block transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/800x600?text=No+Image';
            }}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg text-text transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg text-text transition-all"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImage + 1} / {allImages.length}
          </div>
        </>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {allImages.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage === idx ? 'border-primary' : 'border-border'
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover object-center block"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image';
                  }}
                />
              </button>
            ))}
            {allImages.length > 5 && (
              <button
                onClick={() => setCurrentImage(5)}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-border bg-surface-hover flex items-center justify-center text-sm font-medium"
              >
                +{allImages.length - 5} more
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>

            <img
              src={allImages[currentImage].src}
              alt={allImages[currentImage].alt}
              className="max-w-full max-h-[85vh] object-contain"
            />

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>

            {allImages[currentImage].caption && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm">
                {allImages[currentImage].caption}
              </div>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentImage + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;
