import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';
import { Grid, List, SlidersHorizontal, X } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSettings } from '@/context/SettingsContext';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { settings } = useSettings();

  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value;
  }

  const page = parseInt(filters.page || '1');
  const limit = parseInt(filters.limit || '12');

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesAPI.getAll({ ...filters, page, limit }),
    keepPreviousData: true,
    staleTime: 60000,
  });

  const properties = data?.success ? (data.data.data || data.data) : [];
  const pagination = data?.pagination || data?.data?.pagination;

  // Count active filters (ignoring page & sort)
  const activeFilterCount = Object.keys(filters).filter(
    (k) => k !== 'page' && k !== 'sort' && filters[k]
  ).length;

  const handleFilterChange = (newFilters) => {
    const newParams = { ...filters };
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key])) {
        if (newFilters[key].length === 0) {
          delete newParams[key];
        } else {
          newParams[key] = newFilters[key].join(',');
        }
      } else if (newFilters[key] === '' || newFilters[key] === null || newFilters[key] === undefined) {
        delete newParams[key];
      } else {
        newParams[key] = newFilters[key];
      }
    });
    delete newParams.page;
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...filters, page: newPage });
  };

  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Properties for Sale in Kenya</h1>
        </div>
        <LoadingSkeleton count={12} type="property-card" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight mb-2">
          Properties for Sale in Kenya
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-3xl">
          Browse our comprehensive catalog of verified residential houses, luxury villas, apartments, and commercial parcels.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-surface p-3 sm:p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden btn btn-outline py-2 px-3 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-0.5 bg-background">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-smooth ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-text'}`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-smooth ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-text'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs sm:text-sm text-muted hidden md:inline">
            Showing <strong className="text-text">{pagination?.total || properties.length}</strong> listings
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted hidden sm:inline">Sort:</span>
          <select
            className="input text-xs sm:text-sm py-1.5 px-3 w-auto bg-background"
            value={filters.sort || 'newest'}
            onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-text">Refine Search</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Reset ({activeFilterCount})
                </button>
              )}
            </div>
            <PropertyFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              propertyTypes={settings.property_types || []}
              features={settings.features || []}
            />
          </div>
        </aside>

        {/* Mobile Filter Slide-Over Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative w-full max-w-sm bg-surface h-full shadow-2xl overflow-y-auto flex flex-col z-10">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base text-text">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex-1">
                <PropertyFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleReset}
                  propertyTypes={settings.property_types || []}
                  features={settings.features || []}
                />
              </div>

              <div className="p-4 border-t border-border sticky bottom-0 bg-surface flex gap-3">
                <button
                  onClick={handleReset}
                  className="btn btn-outline flex-1 py-2.5 text-xs font-semibold"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn btn-primary flex-1 py-2.5 text-xs font-semibold shadow-md"
                >
                  Show ({properties.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Listings Section */}
        <main className="flex-1 min-w-0">
          {error ? (
            <EmptyState message="Failed to load properties. Please try again." />
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {!isLoading && properties.length === 0 && (
            <div className="bg-surface rounded-2xl border border-border p-12 text-center max-w-lg mx-auto my-6 shadow-sm">
              <h3 className="text-lg font-bold text-text mb-2">No matching properties found</h3>
              <p className="text-sm text-muted mb-6">
                We couldn't find any properties matching your current filter criteria.
              </p>
              <button
                onClick={handleReset}
                className="btn btn-primary"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Properties;
