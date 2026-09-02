import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import { useSearchParams } from 'react-router-dom';

const PropertyGrid = ({ source = 'list' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const params = Object.fromEntries(searchParams.entries());

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertiesAPI.getAll({ ...params, page, limit }),
    keepPreviousData: true,
  });

  if (isLoading) {
    return <LoadingSkeleton count={6} type="property-card" />;
  }

  if (error) {
    return <EmptyState message="Failed to load properties. Please try again." />;
  }

  const properties = data?.success ? (data.data.data || data.data) : [];
  const pagination = data?.pagination;

  if (!properties || properties.length === 0) {
    return <EmptyState message="No properties found matching your criteria." type="search" />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          onPageChange={(newPage) => {
            setSearchParams({ ...params, page: newPage });
          }}
        />
      )}
    </div>
  );
};

export default PropertyGrid;
