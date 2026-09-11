import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

const PropertySearch = ({ onSearch, initialValues = {} }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialValues);

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onSearch) {
      onSearch(newFilters);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (onSearch) {
      onSearch(filters);
    } else {
      const params = new URLSearchParams();
      if (filters.keyword?.trim()) params.set('keyword', filters.keyword.trim());
      if (filters.property_type) params.set('type', filters.property_type);
      if (filters.min_price) params.set('min_price', filters.min_price);
      if (filters.max_price) params.set('max_price', filters.max_price);
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
      navigate(`/properties?${params.toString()}`);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-4 sm:p-6">
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
          <label className="block text-xs font-semibold text-muted mb-1">Keywords</label>
          <input
            type="text"
            placeholder="Location, estate, town..."
            className="input w-full text-xs sm:text-sm"
            value={filters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Property Type</label>
          <select
            className="input w-full text-xs sm:text-sm"
            value={filters.property_type || ''}
            onChange={(e) => handleInputChange('property_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="plot">Plots</option>
            <option value="land">Land</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="maisonette">Maisonette</option>
            <option value="bungalow">Bungalow</option>
            <option value="townhouse">Townhouse</option>
            <option value="mansion">Mansion</option>
            <option value="commercial">Commercial</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Min Price (KES)</label>
          <input
            type="number"
            placeholder="e.g. 1,000,000"
            className="input w-full text-xs sm:text-sm"
            value={filters.min_price || ''}
            onChange={(e) => handleInputChange('min_price', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Max Price (KES)</label>
          <input
            type="number"
            placeholder="e.g. 50,000,000"
            className="input w-full text-xs sm:text-sm"
            value={filters.max_price || ''}
            onChange={(e) => handleInputChange('max_price', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Bedrooms</label>
          <select
            className="input w-full text-xs sm:text-sm"
            value={filters.bedrooms || ''}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1+ Bedrooms</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>

        <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 flex items-end">
          <button
            type="submit"
            className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>Find Properties</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertySearch;
