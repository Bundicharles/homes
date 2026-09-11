import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Play,
  Image as ImageIcon,
  Film,
  Search,
  SlidersHorizontal,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Copy,
  Check,
  Grid3X3,
  LayoutGrid,
  Info,
  Calendar,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { galleryAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { resolveAssetUrl, formatBytes } from '@/utils';

const Gallery = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'image' | 'video'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'title'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'masonry'
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Set document title & SEO meta description
  useEffect(() => {
    document.title = `Media Gallery | Photos & Videos | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        `Explore high-resolution property photos, video walkthroughs, and virtual tours by ${businessName}.`
      );
    }
  }, [businessName]);

  // Fetch gallery media from public API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['public.gallery', activeTab, searchTerm],
    queryFn: () =>
      galleryAPI.getAll({
        type: activeTab === 'all' ? undefined : activeTab,
        search: searchTerm.trim() || undefined,
        limit: 100,
      }),
    staleTime: 60 * 1000,
  });

  // Extract items
  const rawItems = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    return [];
  }, [data]);

  // Client-side filtering & sorting
  const items = useMemo(() => {
    let list = [...rawItems];

    if (activeTab === 'image') {
      list = list.filter((i) => i.media_type === 'image' || i.mime_type?.startsWith('image/'));
    } else if (activeTab === 'video') {
      list = list.filter((i) => i.media_type === 'video' || i.mime_type?.startsWith('video/'));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.caption && i.caption.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.original_name && i.original_name.toLowerCase().includes(q)) ||
          (i.filename && i.filename.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0));
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.uploaded_at || 0) - new Date(b.uploaded_at || 0));
    } else if (sortOrder === 'title') {
      list.sort((a, b) => (a.title || a.original_name || '').localeCompare(b.title || b.original_name || ''));
    }

    return list;
  }, [rawItems, activeTab, searchTerm, sortOrder]);

  const counts = useMemo(() => {
    const total = rawItems.length;
    const images = rawItems.filter((i) => i.media_type === 'image' || i.mime_type?.startsWith('image/')).length;
    const videos = rawItems.filter((i) => i.media_type === 'video' || i.mime_type?.startsWith('video/')).length;
    return { total, images, videos };
  }, [rawItems]);

  // Lightbox active item
  const currentItem = activeLightboxIndex !== null ? items[activeLightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((prev) => (prev + 1) % items.length);
    }
  }, [activeLightboxIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [activeLightboxIndex, items.length]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, handleNext, handlePrev]);

  // Copy media share link
  const handleCopyShare = (item) => {
    const assetUrl = resolveAssetUrl(item.file_path || item.filename);
    const fullUrl = assetUrl.startsWith('http') ? assetUrl : `${window.location.origin}${assetUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-b from-primary/10 via-surface to-background border-b border-border py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Media & Visual Showcase</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight mb-4">
              Explore Our <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              Immerse yourself in our collection of high-definition property photographs, architectural showcases, and cinematic video walkthroughs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 pt-8">
        {/* Controls & Filter Bar */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-surface-hover/70 rounded-xl border border-border/50 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <span>All Media</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-surface text-muted'}`}>
                {counts.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'image'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Images</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'image' ? 'bg-white/20 text-white' : 'bg-surface text-muted'}`}>
                {counts.images}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'video'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Videos</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'video' ? 'bg-white/20 text-white' : 'bg-surface text-muted'}`}>
                {counts.videos}
              </span>
            </button>
          </div>

          {/* Search, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 text-sm py-2"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input text-sm py-2 w-auto bg-surface border-border"
            >
              <option value="newest">Latest Uploads</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            {/* Layout Toggle */}
            <div className="hidden sm:flex items-center gap-1 border border-border p-1 rounded-xl bg-surface-hover/50">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'grid' ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-text'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('masonry')}
                className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'masonry' ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-text'}`}
                title="Masonry View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card rounded-2xl overflow-hidden animate-pulse min-h-[500px] sm:min-h-[560px]">
                <div className="h-[360px] sm:h-[420px] md:h-[460px] bg-surface-hover" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-surface-hover rounded w-3/4" />
                  <div className="h-3.5 bg-surface-hover rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <p className="text-error font-semibold mb-2">Failed to load media items</p>
            <p className="text-sm text-muted mb-4">Please check your connection and try again.</p>
            <button onClick={() => refetch()} className="btn btn-primary btn-sm mx-auto">
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="card p-16 text-center max-w-lg mx-auto border-dashed">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              {activeTab === 'video' ? <Film className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-text mb-1">No media files found</h3>
            <p className="text-sm text-muted mb-6">
              {searchTerm
                ? `No items matching "${searchTerm}". Try adjusting your search query.`
                : activeTab === 'video'
                ? 'No videos have been uploaded yet. Check back soon for property walkthroughs!'
                : 'No photos have been uploaded yet.'}
            </p>
            {(searchTerm || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
                className="btn btn-outline btn-sm mx-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              layoutMode === 'masonry'
                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 sm:gap-8 space-y-6'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8'
            }
          >
            {items.map((item, index) => {
              const isVideo = item.media_type === 'video' || item.mime_type?.startsWith('video/');
              const assetUrl = resolveAssetUrl(item.file_path || item.filename);
              const displayName = item.title || item.original_name || `Media #${item.id}`;

              return (
                <div
                  key={item.id || index}
                  className={`group card rounded-2xl overflow-hidden bg-surface hover:shadow-2xl transition-all duration-300 border border-border/80 flex flex-col min-h-[500px] sm:min-h-[560px] md:min-h-[600px] ${
                    layoutMode === 'masonry' ? 'break-inside-avoid' : ''
                  }`}
                >
                  {/* Media Preview Container */}
                  <div
                    onClick={() => setActiveLightboxIndex(index)}
                    className="relative h-[360px] sm:h-[420px] md:h-[460px] bg-black/5 overflow-hidden cursor-pointer flex items-center justify-center flex-shrink-0"
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={assetUrl}
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          muted
                          playsInline
                        />
                        {/* Play button overlay badge */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                            <Play className="w-7 h-7 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <Film className="w-3.5 h-3.5 text-primary" />
                          <span>Video</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={assetUrl}
                          alt={item.alt_text || displayName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = `${window.location.origin}/logo.svg`;
                            e.currentTarget.className = 'w-16 h-16 opacity-30 object-contain';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                          <div className="w-12 h-12 rounded-full bg-white/95 text-text flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <ImageIcon className="w-3.5 h-3.5 text-primary" />
                          <span>Photo</span>
                        </div>
                      </>
                    )}

                    {/* Quick copy overlay in top right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyShare(item);
                      }}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                      title="Copy media URL"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Content & Metadata */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3
                        onClick={() => setActiveLightboxIndex(index)}
                        className="font-bold text-text text-base sm:text-lg line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                        title={displayName}
                      >
                        {displayName}
                      </h3>
                      {item.caption && (
                        <p className="text-xs sm:text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        {formatBytes(item.file_size)}
                      </span>
                      {item.width && item.height ? (
                        <span>{item.width} × {item.height}</span>
                      ) : (
                        <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-surface-hover border border-border/50">
                          {item.mime_type ? item.mime_type.split('/')[1] : (isVideo ? 'MP4' : 'IMG')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10 text-white">
            <div className="flex items-center gap-3 max-w-md truncate">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-white uppercase tracking-wider">
                {currentItem.media_type === 'video' || currentItem.mime_type?.startsWith('video/') ? 'Video' : 'Photo'}
              </span>
              <h2 className="text-sm font-semibold truncate">
                {currentItem.title || currentItem.original_name || `Media #${currentItem.id}`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">
                {activeLightboxIndex + 1} of {items.length}
              </span>

              <button
                onClick={() => handleCopyShare(currentItem)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={resolveAssetUrl(currentItem.file_path || currentItem.filename)}
                download={currentItem.original_name || currentItem.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download original file"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Media Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
            {/* Previous Navigation Button */}
            {items.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Media Content */}
            <div className="max-w-6xl max-h-[75vh] w-full flex items-center justify-center">
              {currentItem.media_type === 'video' || currentItem.mime_type?.startsWith('video/') ? (
                <div className="w-full max-h-[75vh] rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                  <video
                    key={currentItem.id}
                    src={resolveAssetUrl(currentItem.file_path || currentItem.filename)}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[75vh] w-auto max-w-full rounded-2xl"
                  />
                </div>
              ) : (
                <img
                  key={currentItem.id}
                  src={resolveAssetUrl(currentItem.file_path || currentItem.filename)}
                  alt={currentItem.alt_text || currentItem.title || 'Gallery image'}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl animate-fade-in"
                />
              )}
            </div>

            {/* Next Navigation Button */}
            {items.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="px-6 py-4 bg-black/40 border-t border-white/10 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              {currentItem.caption && (
                <p className="text-sm font-medium text-slate-200 mb-0.5">{currentItem.caption}</p>
              )}
              {currentItem.description && (
                <p className="text-xs text-slate-400">{currentItem.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                {formatBytes(currentItem.file_size)}
              </span>
              {currentItem.width && currentItem.height && (
                <span>{currentItem.width} × {currentItem.height} px</span>
              )}
              {currentItem.uploaded_at && (
                <span className="flex items-center gap-1.5 hidden sm:inline-flex">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(currentItem.uploaded_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
