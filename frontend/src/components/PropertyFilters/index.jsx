import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const PropertyFilters = ({ filters, onChange, onReset, propertyTypes = [], features = [] }) => {
  const [openGroups, setOpenGroups] = useState({
    type: false,
    price: false,
    features: false,
    verification: false,
    status: false,
  });

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleFeatureToggle = (featureSlug) => {
    const current = filters.features || [];
    const newFeatures = current.includes(featureSlug)
      ? current.filter((f) => f !== featureSlug)
      : [...current, featureSlug];
    onChange({ ...filters, features: newFeatures });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && (Array.isArray(value) ? value.length > 0 : value !== '')
  ).length;

  return (
    <div className="space-y-3">
      {activeFilterCount > 0 && (
        <button
          onClick={onReset}
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}

      <div className="border border-border rounded-lg">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium"
          onClick={() => toggleGroup('type')}
        >
          <span>Property Types</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${openGroups.type ? 'rotate-180' : ''}`} />
        </button>
        {openGroups.type && (
          <div className="px-4 pb-3 space-y-2">
            {propertyTypes.map((type) => (
              <label key={type.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.property_type === type.slug}
                  onChange={(e) => handleFilterChange('property_type', e.target.checked ? type.slug : '')}
                  className="rounded border-border"
                />
                <span className="text-sm">{type.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium"
          onClick={() => toggleGroup('price')}
        >
          <span>Price Range</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${openGroups.price ? 'rotate-180' : ''}`} />
        </button>
        {openGroups.price && (
          <div className="px-4 pb-3 space-y-3">
            <div>
              <input
                type="number"
                placeholder="Min (KSH)"
                className="input"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max (KSH)"
                className="input"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium"
          onClick={() => toggleGroup('features')}
        >
          <span>Features</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${openGroups.features ? 'rotate-180' : ''}`} />
        </button>
        {openGroups.features && (
          <div className="px-4 pb-3 space-y-2">
            {features.map((feature) => (
              <label key={feature.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.features || []).includes(feature.slug)}
                  onChange={() => handleFeatureToggle(feature.slug)}
                  className="rounded border-border"
                />
                <span className="text-sm">{feature.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium"
          onClick={() => toggleGroup('verification')}
        >
          <span>Verification</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${openGroups.verification ? 'rotate-180' : ''}`} />
        </button>
        {openGroups.verification && (
          <div className="px-4 pb-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verification_status === 'Verified'}
                onChange={(e) => handleFilterChange('verification_status', e.target.checked ? 'Verified' : '')}
                className="rounded border-border"
              />
              <span className="text-sm">Verified Only</span>
            </label>
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg">
        <button
          className="w-full flex items-center justify-between p-4 text-left font-medium"
          onClick={() => toggleGroup('status')}
        >
          <span>Property Status</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${openGroups.status ? 'rotate-180' : ''}`} />
        </button>
        {openGroups.status && (
          <div className="px-4 pb-3 space-y-2">
            {['Available', 'Reserved', 'Under Offer', 'Sold'].map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.status_filter || []).includes(status)}
                  onChange={(e) => {
                    const current = filters.status_filter || [];
                    const newStatus = e.target.checked
                      ? [...current, status]
                      : current.filter((s) => s !== status);
                    handleFilterChange('status_filter', newStatus);
                  }}
                  className="rounded border-border"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;
