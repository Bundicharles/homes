import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { LoadingSkeleton, EmptyState, Pagination } from '@/components/Modal';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSettings } from '@/context/SettingsContext';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
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
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...filters, page: newPage });
  };

  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">Properties</h1>
        </div>
        <LoadingSkeleton count={12} type="property-card" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text mb-2">Properties for Sale in Kenya</h1>
      <p className="text-muted mb-6">
        Browse our comprehensive list of residential and commercial properties.
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <select
          className="input w-auto"
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

      <div className="flex gap-8">
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="font-semibold text-text mb-4">Filters</h3>
            <PropertyFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              propertyTypes={settings.property_types || []}
              features={settings.features || []}
            />
          </div>
        </aside>

        <main className="flex-1">
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
            <EmptyState message="No properties found matching your criteria." type="search" />
          )}

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Properties;
