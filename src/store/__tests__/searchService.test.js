import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchService } from '../../services/searchService'

// Mock Algolia
vi.mock('algoliasearch', () => ({
  default: vi.fn(() => ({
    initIndex: vi.fn(() => ({
      search: vi.fn(),
      getSettings: vi.fn(),
      setSettings: vi.fn(),
      saveObject: vi.fn(),
      deleteObject: vi.fn(),
      clearObjects: vi.fn(),
      saveObjects: vi.fn()
    }))
  }))
}))

// Mock Algolia config
vi.mock('../../config/algolia', () => ({
  searchClient: {
    initIndex: vi.fn(() => ({
      search: vi.fn(),
      saveObject: vi.fn(),
      deleteObject: vi.fn()
    }))
  },
  searchIndex: {
    search: vi.fn(),
    saveObject: vi.fn(),
    deleteObject: vi.fn()
  },
  isAlgoliaConfigured: true,
  searchConfig: {
    hitsPerPage: 20,
    attributesToRetrieve: ['name', 'description', 'price'],
    typoTolerance: true
  }
}))

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchProducts', () => {
    it('should search products with query and return results', async () => {
      const mockResults = {
        hits: [
          { objectID: '1', name: 'Himalayan Honey', price: 499 },
          { objectID: '2', name: 'Wild Honey', price: 599 }
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        processingTimeMS: 5,
        facets: {}
      };

      const { searchIndex } = await import('../../config/algolia');
      searchIndex.search.mockResolvedValue(mockResults);

      const result = await searchService.searchProducts('honey');

      expect(searchIndex.search).toHaveBeenCalledWith('honey', expect.any(Object));
      expect(result.hits).toHaveLength(2);
      expect(result.hits[0].name).toContain('Honey');
      expect(result.nbHits).toBe(2);
      expect(result.processingTimeMS).toBe(5);
    });

    it('should apply filters correctly', async () => {
      const mockResults = { hits: [], nbHits: 0, facets: {} };
      
      const { searchIndex } = await import('../../config/algolia');
      searchIndex.search.mockResolvedValue(mockResults);

      const filters = {
        categories: ['honey'],
        priceRange: { min: 200, max: 600 },
        rating: 4
      };

      await searchService.searchProducts('', filters);

      expect(searchIndex.search).toHaveBeenCalledWith('', expect.objectContaining({
        filters: expect.stringContaining('category:"honey"'),
        numericFilters: expect.arrayContaining([
          'price >= 200',
          'price <= 600',
          'rating >= 4'
        ])
      }));
    });

    it('should handle search errors gracefully', async () => {
      const { searchIndex } = await import('../../config/algolia');
      searchIndex.search.mockRejectedValue(new Error('Search failed'));

      await expect(searchService.searchProducts('honey')).rejects.toThrow('Search failed');
    });

    it('should track search queries for analytics', async () => {
      const mockResults = { hits: [], nbHits: 0, facets: {} };
      const { searchIndex } = await import('../../config/algolia');
      searchIndex.search.mockResolvedValue(mockResults);

      await searchService.searchProducts('honey');

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.queries).toHaveLength(1);
      expect(analytics.queries[0]).toEqual(expect.objectContaining({
        query: 'honey'
      }));
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return autocomplete suggestions', async () => {
      const mockSuggestions = {
        hits: [
          { name: 'himalayan honey', _highlightResult: { name: { value: '<em>himalayan</em> honey' } } },
          { name: 'himalayan salt', _highlightResult: { name: { value: '<em>himalayan</em> salt' } } }
        ]
      };

      const { searchIndex } = await import('../../config/algolia');
      searchIndex.search.mockResolvedValue(mockSuggestions);

      const result = await searchService.getSearchSuggestions('himalayan');

      expect(result).toHaveLength(2);
      expect(result[0].query).toBe('himalayan honey');
      expect(result[0].highlighted).toContain('<em>himalayan</em>');
    });

    it('should return empty array for short queries', async () => {
      const result = await searchService.getSearchSuggestions('h');
      expect(result).toEqual([]);
    });
  });

  describe('indexProduct', () => {
    it('should index product correctly', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        price: 299,
        category: 'test'
      };

      const { searchIndex } = await import('../../config/algolia');
      searchIndex.saveObject.mockResolvedValue({ objectID: '1' });

      await searchService.indexProduct(product);

      expect(searchIndex.saveObject).toHaveBeenCalledWith(expect.objectContaining({
        objectID: '1',
        name: 'Test Product',
        price: 299,
        category: 'test'
      }));
    });

    it('should generate search tags for products', async () => {
      const product = {
        id: '1',
        name: 'Expensive Premium Product',
        price: 999,
        category: 'honey',
        rating: 4.8,
        quantityAvailable: 15
      };

      const { searchIndex } = await import('../../config/algolia');
      searchIndex.saveObject.mockResolvedValue({ objectID: '1' });

      await searchService.indexProduct(product);

      const calledWith = searchIndex.saveObject.mock.calls[0][0];
      expect(calledWith.tags).toContain('honey');
      expect(calledWith.tags).toContain('premium');
      expect(calledWith.tags).toContain('highly-rated');
      expect(calledWith.tags).toContain('in-stock');
    });
  });

  describe('analytics', () => {
    it('should track search queries', () => {
      const query = 'himalayan honey';
      const filters = { categories: ['honey'] };
      
      searchService.trackSearch(query, filters);

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.queries).toHaveLength(1);
      expect(analytics.queries[0]).toEqual(expect.objectContaining({
        query,
        filters
      }));
    });

    it('should track click events', () => {
      const productId = 'product-1';
      const query = 'honey';
      const position = 2;
      
      searchService.trackClick(productId, query, position);

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.clicks).toHaveLength(1);
      expect(analytics.clicks[0]).toEqual(expect.objectContaining({
        productId,
        query,
        position
      }));
    });

    it('should calculate click-through rate', () => {
      searchService.trackSearch('honey');
      searchService.trackSearch('pickle');
      searchService.trackClick('product-1', 'honey');

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.clickThroughRate).toBe(50); // 1 click / 2 queries * 100
    });

    it('should limit stored analytics data', () => {
      // Add more than 1000 queries
      for (let i = 0; i < 1100; i++) {
        searchService.trackSearch(`query-${i}`);
      }

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.queries).toHaveLength(1000); // Should be limited to 1000
    });
  });

  describe('trending and popular searches', () => {
    it('should return trending searches', () => {
      const trending = searchService.getTrendingSearches();
      
      expect(trending).toBeInstanceOf(Array);
      expect(trending.length).toBeGreaterThan(0);
      expect(trending[0]).toHaveProperty('query');
      expect(trending[0]).toHaveProperty('popularity');
    });

    it('should return popular searches based on analytics', () => {
      // Track some searches
      searchService.trackSearch('honey');
      searchService.trackSearch('honey');
      searchService.trackSearch('pickle');

      const popular = searchService.getPopularSearches();
      
      expect(popular).toBeInstanceOf(Array);
      expect(popular[0].query).toBe('honey');
      expect(popular[0].count).toBe(2);
    });
  });
});