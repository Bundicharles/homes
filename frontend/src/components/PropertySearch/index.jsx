import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const PropertySearch = ({ onSearch, initialValues = {} }) => {
  const [filters, setFilters] = useState(initialValues);

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch?.(newFilters);
  };

  return (
    <div className="bg-surface rounded-xl shadow-card border border-border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <input
            type="text"
            placeholder="Location, keyword..."
            className="input w-full"
            value={filters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
          />
        </div>

        <div>
          <select
            className="input w-full"
            value={filters.property_type || ''}
            onChange={(e) => handleInputChange('property_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="maisonette">Maisonette</option>
            <option value="bungalow">Bungalow</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div>
          <input
            type="number"
            placeholder="Min price (KES)"
            className="input w-full"
            value={filters.min_price || ''}
            onChange={(e) => handleInputChange('min_price', e.target.value)}
          />
        </div>

        <div>
          <input
            type="number"
            placeholder="Max price (KES)"
            className="input w-full"
            value={filters.max_price || ''}
            onChange={(e) => handleInputChange('max_price', e.target.value)}
          />
        </div>

        <div>
          <select
            className="input w-full"
            value={filters.bedrooms || ''}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
          >
            <option value="">Bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSearch?.(filters)}
            className="btn btn-primary flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
