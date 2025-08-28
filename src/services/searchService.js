// Advanced Search Service with Algolia Integration
import { searchClient, searchIndex, isAlgoliaConfigured, searchConfig } from '../config/algolia';

class SearchService {
  constructor() {
    this.client = searchClient;
    this.index = searchIndex;
    this.isConfigured = isAlgoliaConfigured;
    this.analytics = {
      queries: [],
      clicks: [],
      conversions: []
    };
  }

  /**
   * Search products with advanced Algolia features
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @param {Object} options - Additional search options
   * @returns {Promise} Search results
   */
  async searchProducts(query = '', filters = {}, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Algolia not configured. Please set up environment variables.');
    }

    try {
      const searchParams = {
        ...searchConfig,
        ...options,
        filters: this.buildFilters(filters),
        numericFilters: this.buildNumericFilters(filters),
        facetFilters: this.buildFacetFilters(filters),
        page: options.page || 0,
        hitsPerPage: options.hitsPerPage || searchConfig.hitsPerPage
      };

      const results = await this.index.search(query, searchParams);
      
      // Track search query
      this.trackSearch(query, filters);
      
      return {
        hits: results.hits,
        nbHits: results.nbHits,
        page: results.page,
        nbPages: results.nbPages,
        facets: results.facets,
        processingTimeMS: results.processingTimeMS,
        query: results.query
      };
    } catch (error) {
      console.error('Algolia search error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   * @param {string} query - Partial query
   * @returns {Promise} Suggestions array
   */
  async getSearchSuggestions(query) {
    if (!this.isConfigured || !query || query.length < 2) {
      return [];
    }

    try {
      const results = await this.index.search(query, {
        hitsPerPage: 5,
        attributesToRetrieve: ['name'],
        attributesToHighlight: ['name'],
        typoTolerance: true
      });

      return results.hits.map(hit => ({
        query: hit.name,
        highlighted: hit._highlightResult?.name?.value || hit.name,
        nbHits: hit.nbHits || 0
      }));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get trending searches
   * @returns {Array} Trending search queries
   */
  getTrendingSearches() {
    // In production, this would come from Algolia Analytics
    const trending = [
      'himalayan honey',
      'organic pickle',
      'wild honey',
      'darjeeling tea',
      'mountain spices',
      'traditional grains'
    ];

    return trending.map(query => ({
      query,
      popularity: Math.floor(Math.random() * 100) + 1
    })).sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get popular searches based on analytics
   * @returns {Array} Popular search queries
   */
  getPopularSearches() {
    const queryCount = {};
    this.analytics.queries.forEach(query => {
      queryCount[query] = (queryCount[query] || 0) + 1;
    });

    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Index a product to Algolia
   * @param {Object} product - Product data
   * @returns {Promise} Indexing result
   */
  async indexProduct(product) {
    if (!this.isConfigured) {
      console.warn('Algolia not configured, skipping product indexing');
      return;
    }

    try {
      const searchableProduct = {
        objectID: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        quantityAvailable: product.quantityAvailable,
        origin: product.origin,
        artisan: product.artisan,
        tags: this.generateSearchTags(product),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };

      const result = await this.index.saveObject(searchableProduct);
      console.log('Product indexed successfully:', product.id);
      return result;
    } catch (error) {
      console.error('Error indexing product:', error);
      throw error;
    }
  }

  /**
   * Remove product from Algolia index
   * @param {string} productId - Product ID to remove
   * @returns {Promise} Deletion result
   */
  async removeProduct(productId) {
    if (!this.isConfigured) {
      return;
    }

    try {
      const result = await this.index.deleteObject(productId);
      console.log('Product removed from index:', productId);
      return result;
    } catch (error) {
      console.error('Error removing product from index:', error);
      throw error;
    }
  }

  /**
   * Bulk index products
   * @param {Array} products - Array of products to index
   * @returns {Promise} Bulk indexing result
   */
  async bulkIndexProducts(products) {
    if (!this.isConfigured) {
      console.warn('Algolia not configured, skipping bulk indexing');
      return;
    }

    try {
      const searchableProducts = products.map(product => ({
        objectID: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        quantityAvailable: product.quantityAvailable,
        origin: product.origin,
        artisan: product.artisan,
        tags: this.generateSearchTags(product)
      }));

      const result = await this.index.saveObjects(searchableProducts);
      console.log(`Bulk indexed ${products.length} products`);
      return result;
    } catch (error) {
      console.error('Error bulk indexing products:', error);
      throw error;
    }
  }

  /**
   * Configure search index settings
   * @returns {Promise} Configuration result
   */
  async configureIndex() {
    if (!this.isConfigured) {
      return;
    }

    try {
      const settings = {
        ...searchConfig,
        searchableAttributes: [
          'name',
          'description',
          'category',
          'origin',
          'artisan',
          'tags'
        ],
        attributesForFaceting: [
          'filterOnly(category)',
          'filterOnly(origin)',
          'filterOnly(artisan)',
          'rating',
          'price'
        ],
        customRanking: [
          'desc(rating)',
          'desc(quantityAvailable)',
          'asc(price)'
        ]
      };

      const result = await this.index.setSettings(settings);
      console.log('Algolia index configured successfully');
      return result;
    } catch (error) {
      console.error('Error configuring index:', error);
      throw error;
    }
  }

  /**
   * Build filter string for Algolia
   * @param {Object} filters - Filter object
   * @returns {string} Filter string
   */
  buildFilters(filters) {
    const filterParts = [];

    if (filters.categories && filters.categories.length > 0) {
      const categoryFilters = filters.categories.map(cat => `category:"${cat}"`);
      filterParts.push(`(${categoryFilters.join(' OR ')})`);
    }

    if (filters.origins && filters.origins.length > 0) {
      const originFilters = filters.origins.map(origin => `origin:"${origin}"`);
      filterParts.push(`(${originFilters.join(' OR ')})`);
    }

    if (filters.artisans && filters.artisans.length > 0) {
      const artisanFilters = filters.artisans.map(artisan => `artisan:"${artisan}"`);
      filterParts.push(`(${artisanFilters.join(' OR ')})`);
    }

    if (filters.inStock) {
      filterParts.push('quantityAvailable > 0');
    }

    return filterParts.join(' AND ');
  }

  /**
   * Build numeric filters for Algolia
   * @param {Object} filters - Filter object
   * @returns {Array} Numeric filters array
   */
  buildNumericFilters(filters) {
    const numericFilters = [];

    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        numericFilters.push(`price >= ${filters.priceRange.min}`);
      }
      if (filters.priceRange.max !== undefined) {
        numericFilters.push(`price <= ${filters.priceRange.max}`);
      }
    }

    if (filters.rating && filters.rating > 0) {
      numericFilters.push(`rating >= ${filters.rating}`);
    }

    return numericFilters;
  }

  /**
   * Build facet filters for Algolia
   * @param {Object} filters - Filter object
   * @returns {Array} Facet filters array
   */
  buildFacetFilters(filters) {
    const facetFilters = [];

    // Add any additional facet-based filtering here
    
    return facetFilters;
  }

  /**
   * Generate search tags for better discoverability
   * @param {Object} product - Product object
   * @returns {Array} Search tags
   */
  generateSearchTags(product) {
    const tags = [];

    // Add category-based tags
    if (product.category) {
      tags.push(product.category);
    }

    // Add origin-based tags
    if (product.origin) {
      const originParts = product.origin.split(',');
      tags.push(...originParts.map(part => part.trim().toLowerCase()));
    }

    // Add price-based tags
    if (product.price < 200) tags.push('budget-friendly');
    else if (product.price > 500) tags.push('premium');

    // Add rating-based tags
    if (product.rating >= 4.5) tags.push('highly-rated');
    else if (product.rating >= 4) tags.push('well-rated');

    // Add availability tags
    if (product.quantityAvailable > 10) tags.push('in-stock');
    else if (product.quantityAvailable > 0) tags.push('limited-stock');
    else tags.push('out-of-stock');

    return tags;
  }

  /**
   * Track search query for analytics
   * @param {string} query - Search query
   * @param {Object} filters - Applied filters
   */
  trackSearch(query, filters = {}) {
    this.analytics.queries.push({
      query,
      filters,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 queries
    if (this.analytics.queries.length > 1000) {
      this.analytics.queries = this.analytics.queries.slice(-1000);
    }
  }

  /**
   * Track click on search result
   * @param {string} productId - Clicked product ID
   * @param {string} query - Search query that led to click
   * @param {number} position - Position in search results
   */
  trackClick(productId, query, position = 0) {
    this.analytics.clicks.push({
      productId,
      query,
      position,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 clicks
    if (this.analytics.clicks.length > 1000) {
      this.analytics.clicks = this.analytics.clicks.slice(-1000);
    }
  }

  /**
   * Track conversion (purchase) from search
   * @param {string} productId - Purchased product ID
   * @param {string} query - Search query that led to purchase
   */
  trackConversion(productId, query) {
    this.analytics.conversions.push({
      productId,
      query,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get search analytics data
   * @returns {Object} Analytics data
   */
  getSearchAnalytics() {
    return {
      queries: this.analytics.queries,
      clicks: this.analytics.clicks,
      conversions: this.analytics.conversions,
      popularQueries: this.getPopularSearches(),
      clickThroughRate: this.calculateClickThroughRate(),
      conversionRate: this.calculateConversionRate()
    };
  }

  /**
   * Calculate click-through rate
   * @returns {number} CTR percentage
   */
  calculateClickThroughRate() {
    if (this.analytics.queries.length === 0) return 0;
    return (this.analytics.clicks.length / this.analytics.queries.length) * 100;
  }

  /**
   * Calculate conversion rate
   * @returns {number} Conversion percentage
   */
  calculateConversionRate() {
    if (this.analytics.clicks.length === 0) return 0;
    return (this.analytics.conversions.length / this.analytics.clicks.length) * 100;
  }

  /**
   * Get search insights and recommendations
   * @returns {Object} Search insights
   */
  getSearchInsights() {
    const analytics = this.getSearchAnalytics();
    
    return {
      topQueries: analytics.popularQueries.slice(0, 10),
      noResultQueries: this.getNoResultQueries(),
      lowClickQueries: this.getLowClickQueries(),
      recommendations: this.getSearchRecommendations()
    };
  }

  /**
   * Get queries that returned no results
   * @returns {Array} No result queries
   */
  getNoResultQueries() {
    // This would be implemented with actual search result tracking
    return [];
  }

  /**
   * Get queries with low click-through rates
   * @returns {Array} Low CTR queries
   */
  getLowClickQueries() {
    // This would be implemented with actual CTR analysis
    return [];
  }

  /**
   * Get search optimization recommendations
   * @returns {Array} Recommendations
   */
  getSearchRecommendations() {
    const recommendations = [];
    
    const ctr = this.calculateClickThroughRate();
    if (ctr < 10) {
      recommendations.push({
        type: 'low_ctr',
        message: 'Consider improving search result relevance',
        action: 'Review ranking configuration'
      });
    }

    return recommendations;
  }
}

export const searchService = new SearchService();
export default searchService;