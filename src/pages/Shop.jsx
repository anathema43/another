import React, { useState } from "react";
import { useProductStore } from "../store/productStore";
import ProductCard from "../components/ProductCard";
import AlgoliaSearch from "../components/AlgoliaSearch";
import SearchFilters from "../components/SearchFilters";
import SearchResults from "../components/SearchResults";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { searchService } from "../services/searchService";

export default function Shop() {
  const { products, fetchProducts, loading } = useProductStore();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    // Always fetch products from Firestore - single source of truth
    fetchProducts();
  }, [products.length, fetchProducts]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setSearchQuery(results.query || "");
    setIsSearching(false);
  };

  const handleSearchClear = () => {
    setSearchResults(null);
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleFiltersChange = async (filters) => {
    if (searchQuery) {
      setIsSearching(true);
      try {
        const results = await searchService.searchProducts(searchQuery, filters);
        setSearchResults({
          products: results.hits,
          totalResults: results.nbHits,
          query: searchQuery,
          processingTime: results.processingTimeMS,
          facets: results.facets
        });
      } catch (error) {
        console.error('Filter search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Determine what to display
  const displayProducts = searchResults ? searchResults.products : products;
  const showSearchResults = searchResults !== null;

  return (
    <main className="min-h-screen bg-gray-50" data-cy="shop-page">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-himalaya-dark mb-2">Shop Ramro Products</h1>
          <p className="text-gray-600">Discover authentic, organic products from the Himalayas</p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading && !showSearchResults ? (
          <div className="flex justify-center py-12" role="status" aria-label="Loading products">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
            <span className="sr-only">Loading products...</span>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <section className="bg-white rounded-lg shadow-sm p-6 mb-8" aria-label="Product filters">
              <div className="space-y-4">
                {/* Algolia Search */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1">
                    <AlgoliaSearch
                      onResults={handleSearchResults}
                      onClear={handleSearchClear}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Search Filters */}
                  <SearchFilters
                    onFiltersChange={handleFiltersChange}
                    facets={searchResults?.facets || {}}
                  />
                </div>

                {/* Search Status */}
                {showSearchResults && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {searchResults.totalResults} results for "{searchQuery}"
                      {searchResults.processingTime && (
                        <span className="ml-2">({searchResults.processingTime}ms)</span>
                      )}
                    </span>
                    <button
                      onClick={handleSearchClear}
                      className="text-organic-primary hover:text-organic-text"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Search Results or Product Grid */}
            {showSearchResults ? (
              <SearchResults
                results={searchResults}
                isLoading={isSearching}
                query={searchQuery}
              />
            ) : (
              <section aria-label="Product catalog">
                {displayProducts.length === 0 ? (
                  <div className="text-center py-12" data-cy="no-results-message">
                    <p className="text-gray-500 text-lg">
                      No products found.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-600">
                        Showing {displayProducts.length} of {products.length} products
                      </p>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-cy="product-grid">
                      {displayProducts.map((product) => (
                        <li key={product.id}>
                          <ProductCard product={product} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}