import React, { useState } from "react";
import { useProductStore } from "../store/productStore";
import { useCategoryStore } from "../store/categoryStore";
import ProductCard from "../components/ProductCard";
import AlgoliaSearch from "../components/AlgoliaSearch";
import SearchFilters from "../components/SearchFilters";
import SearchResults from "../components/SearchResults";
import { MagnifyingGlassIcon, FunnelIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ResponsiveImage from "../components/ResponsiveImage";
import { searchService } from "../services/searchService";

export default function Shop() {
  const { products, fetchProducts, loading } = useProductStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('categories'); // 'categories' or 'products'

  React.useEffect(() => {
    // Always fetch products from Firestore - single source of truth
    fetchProducts();
    fetchCategories();
  }, [products.length, fetchProducts]);

  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setSearchQuery(results.query || "");
    setIsSearching(false);
    setViewMode('products');
  };

  const handleSearchClear = () => {
    setSearchResults(null);
    setSearchQuery("");
    setIsSearching(false);
    setViewMode('categories');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setViewMode('products');
    setSearchResults(null);
    setSearchQuery("");
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSearchResults(null);
    setSearchQuery("");
  };

  const handleFiltersChange = async (filters) => {
    if (searchQuery) {
      setIsSearching(true);
      try {
        const categoryFilter = selectedCategory ? { categories: [selectedCategory.name] } : {};
        const combinedFilters = { ...filters, ...categoryFilter };
        const results = await searchService.searchProducts(searchQuery, combinedFilters);
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
  const displayProducts = searchResults 
    ? searchResults.products 
    : selectedCategory 
      ? products.filter(p => p.category === selectedCategory.name.toLowerCase().replace(/\s+/g, '-'))
      : products;
  const showSearchResults = searchResults !== null;

  return (
    <main className="min-h-screen bg-gray-50" data-cy="shop-page">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            {(viewMode === 'products' || searchResults) && (
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-organic-primary hover:text-organic-text"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Categories
              </button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-himalaya-dark mb-2">
                {selectedCategory ? selectedCategory.name : 'Shop Darjeeling Souls Products'}
              </h1>
              <p className="text-gray-600">
                {selectedCategory 
                  ? selectedCategory.description 
                  : 'Discover authentic, organic products from the Himalayas'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar - Always Visible */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8" aria-label="Product search">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <AlgoliaSearch
                  onResults={handleSearchResults}
                  onClear={handleSearchClear}
                  className="w-full"
                />
              </div>
              
              <SearchFilters
                onFiltersChange={handleFiltersChange}
                facets={searchResults?.facets || {}}
              />
            </div>

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

        {/* Category Grid View */}
        {viewMode === 'categories' && !searchResults && (
          <section aria-label="Product categories">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-organic-text mb-4">Shop by Category</h2>
              <p className="text-organic-text opacity-75">Choose a category to explore our authentic products</p>
            </div>
            
            {categoriesLoading ? (
              <div className="flex justify-center py-12" role="status" aria-label="Loading categories">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
                <span className="sr-only">Loading categories...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* All Products Card */}
                <button
                  onClick={() => handleCategorySelect({ name: 'All Products', description: 'Browse our complete collection' })}
                  className="bg-gradient-to-br from-organic-primary to-organic-highlight text-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                >
                  <div className="h-48 flex items-center justify-center bg-organic-text">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏔️</div>
                      <div className="text-xl font-bold">All Products</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Browse Everything</h3>
                    <p className="text-sm opacity-90">Explore our complete collection of authentic Darjeeling products</p>
                  </div>
                </button>

                {/* Category Cards */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                  >
                    <ResponsiveImage
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-48"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-organic-text text-lg mb-2">{category.name}</h3>
                      <p className="text-organic-text opacity-75 text-sm">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Products View */}
        {(viewMode === 'products' || searchResults) && (loading && !showSearchResults ? (
          <div className="flex justify-center py-12" role="status" aria-label="Loading products">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
            <span className="sr-only">Loading products...</span>
          </div>
        ) : (
          <>
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
                      <div>
                        <p className="text-gray-600">
                          Showing {displayProducts.length} products
                          {selectedCategory && selectedCategory.name !== 'All Products' && (
                            <span> in {selectedCategory.name}</span>
                          )}
                        </p>
                      </div>
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
        ))}
      </section>
    </main>
  );
}