import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchFilters({ 
  onFiltersChange, 
  facets = {}, 
  initialFilters = {},
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    origins: [],
    artisans: [],
    priceRange: { min: 0, max: 2000 },
    rating: 0,
    inStock: false,
    ...initialFilters
  });

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleOriginChange = (origin) => {
    setFilters(prev => ({
      ...prev,
      origins: prev.origins.includes(origin)
        ? prev.origins.filter(o => o !== origin)
        : [...prev.origins, origin]
    }));
  };

  const handleArtisanChange = (artisan) => {
    setFilters(prev => ({
      ...prev,
      artisans: prev.artisans.includes(artisan)
        ? prev.artisans.filter(a => a !== artisan)
        : [...prev.artisans, artisan]
    }));
  };

  const handlePriceChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      origins: [],
      artisans: [],
      priceRange: { min: 0, max: 2000 },
      rating: 0,
      inStock: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.origins.length > 0) count++;
    if (filters.artisans.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 2000) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        data-cy="algolia-filters-button"
      >
        <FunnelIcon className="w-5 h-5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-organic-primary text-white text-xs px-2 py-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-organic-text">Search Filters</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Categories */}
              {facets.category && Object.keys(facets.category).length > 0 && (
                <div data-cy="algolia-category-filter">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(facets.category).map(([category, count]) => (
                      <label key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
                            data-cy={`filter-${category}`}
                          />
                          <span className="text-sm capitalize">{category}</span>
                        </div>
                        <span className="text-xs text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div data-cy="algolia-price-filter">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full"
                    data-cy="price-range-slider"
                  />
                </div>
              </div>

              {/* Rating */}
              <div data-cy="algolia-rating-filter">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`p-1 ${
                        rating <= filters.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      data-cy={`rating-${rating}-plus`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                  </span>
                </div>
              </div>

              {/* Origins */}
              {facets.origin && Object.keys(facets.origin).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(facets.origin).map(([origin, count]) => (
                      <label key={origin} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.origins.includes(origin)}
                            onChange={() => handleOriginChange(origin)}
                            className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
                          />
                          <span className="text-sm">{origin}</span>
                        </div>
                        <span className="text-xs text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Artisans */}
              {facets.artisan && Object.keys(facets.artisan).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artisan
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(facets.artisan).map(([artisan, count]) => (
                      <label key={artisan} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.artisans.includes(artisan)}
                            onChange={() => handleArtisanChange(artisan)}
                            className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
                          />
                          <span className="text-sm">{artisan}</span>
                        </div>
                        <span className="text-xs text-gray-500">({count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Filters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}