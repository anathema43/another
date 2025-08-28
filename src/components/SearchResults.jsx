import React from 'react';
import ProductCard from './ProductCard';
import { ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchResults({ 
  results, 
  isLoading = false, 
  query = '', 
  className = '' 
}) {
  const { products = [], totalResults = 0, processingTime = 0, error = null } = results || {};

  if (isLoading) {
    return (
      <div className={`${className}`} data-cy="search-loading">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-primary mr-3"></div>
          <span className="text-organic-text">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`} data-cy="search-error">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-organic-text mb-2">Search Error</h3>
          <p className="text-organic-text opacity-75 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (query && products.length === 0) {
    return (
      <div className={`${className}`} data-cy="no-results-message">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-organic-text mb-2">No Results Found</h3>
          <p className="text-organic-text opacity-75 mb-4">
            No products found for "<strong>{query}</strong>"
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto" data-cy="search-suggestions">
            <h4 className="font-medium text-organic-text mb-2">Try searching for:</h4>
            <div className="flex flex-wrap gap-2">
              {['himalayan honey', 'organic pickle', 'wild honey', 'mountain spices'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    const searchInput = document.querySelector('[data-cy="algolia-search-input"]');
                    if (searchInput) {
                      searchInput.value = suggestion;
                      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="text-sm bg-white px-3 py-1 rounded-full border hover:bg-organic-primary hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`} data-cy="search-results">
      {/* Results Header */}
      {query && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-organic-text">
              Search Results for "{query}"
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>{totalResults.toLocaleString()} products found</span>
              {processingTime > 0 && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {processingTime}ms
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-cy="search-results-grid">
          {products.map((product) => (
            <div key={product.objectID || product.id} data-cy="search-result-item">
              <ProductCard 
                product={{
                  id: product.objectID || product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  image: product.image,
                  rating: product.rating,
                  quantityAvailable: product.quantityAvailable,
                  category: product.category,
                  origin: product.origin,
                  artisan: product.artisan
                }}
                onProductClick={(productId) => {
                  // Track click for analytics
                  const position = products.findIndex(p => (p.objectID || p.id) === productId);
                  searchService.trackClick(productId, query, position);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More / Pagination could go here */}
    </div>
  );
}