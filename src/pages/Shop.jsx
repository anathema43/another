import React, { useState } from "react";
import { useProductStore } from "../store/productStore";
import { useCategoryStore } from "../store/categoryStore";
import ProductCard from "../components/ProductCard";
import AlgoliaSearch from "../components/AlgoliaSearch";
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
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'products_by_category', 'search_results'

  React.useEffect(() => {
    // Always fetch products from Firestore - single source of truth
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setSearchQuery(results.query || "");
    setIsSearching(false);
    if (results.totalResults > 0) {
      setCurrentView('search_results');
    } else {
      // No results found - will be handled by SearchResults component
      setCurrentView('search_results');
    }
  };

  const handleSearchClear = () => {
    setSearchResults(null);
    setSearchQuery("");
    setIsSearching(false);
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const handleNoResults = () => {
    // Called when search has no results - return to categories
    setCurrentView('categories');
    setSearchResults(null);
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView('products_by_category');
    setSearchResults(null);
    setSearchQuery("");
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSearchResults(null);
    setSearchQuery("");
  };

  // Get unique categories from products if categories store is empty
  const displayCategories = React.useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    
    // Generate categories from products
    const productCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
    return productCategories.map(category => ({
      id: `product-category-${category}`,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      slug: category,
      description: `Authentic ${category} products from the Darjeeling hills`,
      imageUrl: getDefaultCategoryImage(category)
    }));
  }, [categories, products]);

  // Get default image for category
  const getDefaultCategoryImage = (category) => {
    const categoryImages = {
      pickle: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800',
      honey: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800',
      grains: 'https://images.pexels.com/photos/33239/wheat-field-wheat-cereals-grain.jpg?auto=compress&cs=tinysrgb&w=800',
      spices: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800',
      dairy: 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    return categoryImages[category] || 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  // Determine what products to display
  const displayProducts = React.useMemo(() => {
    if (searchResults) {
      return searchResults.products;
    }
    
    if (selectedCategory) {
      if (selectedCategory.slug === 'all') {
        return products;
      }
      return products.filter(p => p.category === selectedCategory.slug);
    }
    
    return products;
  }, [searchResults, selectedCategory, products]);

  const showSearchResults = searchResults !== null;

  return (
    <main className="min-h-screen bg-gray-50" data-cy="shop-page">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            {(currentView !== 'categories') && (
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
        {/* Search Bar - Simple and Clean */}
        <div className="mb-8" aria-label="Product search">
          <AlgoliaSearch
            onResults={handleSearchResults}
            onClear={handleSearchClear}
            className="w-full"
          />
          
          {showSearchResults && (
            <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
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

        {/* Category Grid View */}
        {currentView === 'categories' && (
          <section aria-label="Product categories">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-organic-text mb-4">Shop by Category</h2>
              <p className="text-organic-text opacity-75">Choose a category to explore our authentic products</p>
            </div>
            
            {(categoriesLoading || loading) ? (
              <div className="flex justify-center py-12" role="status" aria-label="Loading categories">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
                <span className="sr-only">Loading categories...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* All Products Card */}
                <button
                  onClick={() => handleCategorySelect({ 
                    name: 'All Products', 
                    slug: 'all', 
                    description: 'Browse our complete collection' 
                  })}
                  className="bg-gradient-to-br from-organic-primary to-organic-highlight text-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                >
                  <div className="h-48 flex items-center justify-center bg-organic-text">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏔️</div>
                      <div className="text-xl font-bold">All Products</div>
                      <div className="text-sm opacity-90 mt-1">{products.length} items</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Browse Everything</h3>
                    <p className="text-sm opacity-90">Explore our complete collection of authentic Darjeeling products</p>
                  </div>
                </button>

                {/* Category Cards */}
                {displayCategories.map((category) => {
                  const categoryProductCount = products.filter(p => p.category === category.slug).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                    >
                      <div className="relative">
                        <ResponsiveImage
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-48"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1">
                          <span className="text-xs font-semibold text-organic-text">
                            {categoryProductCount} items
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-organic-text text-lg mb-2">{category.name}</h3>
                        <p className="text-organic-text opacity-75 text-sm">{category.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Products View */}
        {currentView !== 'categories' && (
          <>
            {/* Search Results or Product Grid */}
            {showSearchResults ? (
              <SearchResults
                results={searchResults}
                isLoading={isSearching}
                query={searchQuery}
                onNoResults={handleNoResults}
              />
            ) : (
              <section aria-label="Product catalog">
                {loading ? (
                  <div className="flex justify-center py-12" role="status" aria-label="Loading products">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
                    <span className="sr-only">Loading products...</span>
                  </div>
                ) : displayProducts.length === 0 ? (
                  <div className="text-center py-12" data-cy="no-results-message">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-organic-text mb-2">No Products Found</h3>
                    <p className="text-organic-text opacity-75 mb-6">
                      {selectedCategory && selectedCategory.slug !== 'all' 
                        ? `No products available in the ${selectedCategory.name} category yet.`
                        : 'No products available yet.'
                      }
                    </p>
                    <button
                      onClick={handleBackToCategories}
                      className="bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
                    >
                      Browse Other Categories
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-organic-text mb-2">
                          {selectedCategory?.name || 'All Products'}
                        </h2>
                        <p className="text-gray-600">
                          Showing {displayProducts.length} products
                          {selectedCategory && selectedCategory.slug !== 'all' && (
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
        )}
      </section>
    </main>
  );
}