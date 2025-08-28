import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchService } from '../searchService'

// Mock Algolia
vi.mock('algoliasearch', () => ({
  default: vi.fn(() => ({
    initIndex: vi.fn(() => ({
      search: vi.fn(),
      getSettings: vi.fn(),
      setSettings: vi.fn(),
      saveObject: vi.fn(),
      deleteObject: vi.fn(),
      clearObjects: vi.fn()
    }))
  }))
}))

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const mockResults = {
        hits: [
          { objectID: '1', name: 'Himalayan Honey', price: 499 },
          { objectID: '2', name: 'Wild Honey', price: 599 }
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1
      };

      const algoliasearch = await import('algoliasearch');
      const mockIndex = {
        search: vi.fn().mockResolvedValue(mockResults)
      };
      algoliasearch.default.mockReturnValue({
        initIndex: vi.fn().mockReturnValue(mockIndex)
      });

      const result = await searchService.searchProducts('honey');

      expect(mockIndex.search).toHaveBeenCalledWith('honey', expect.any(Object));
      expect(result.hits).toHaveLength(2);
      expect(result.hits[0].name).toContain('Honey');
    });

    it('should apply filters correctly', async () => {
      const mockResults = { hits: [], nbHits: 0 };
      
      const algoliasearch = await import('algoliasearch');
      const mockIndex = {
        search: vi.fn().mockResolvedValue(mockResults)
      };
      algoliasearch.default.mockReturnValue({
        initIndex: vi.fn().mockReturnValue(mockIndex)
      });

      const filters = {
        categories: ['honey'],
        priceRange: { min: 200, max: 600 },
        rating: 4
      };

      await searchService.searchProducts('', filters);

      expect(mockIndex.search).toHaveBeenCalledWith('', expect.objectContaining({
        filters: expect.stringContaining('category:honey'),
        numericFilters: expect.arrayContaining([
          'price >= 200',
          'price <= 600',
          'rating >= 4'
        ])
      }));
    });

    it('should handle search errors gracefully', async () => {
      const algoliasearch = await import('algoliasearch');
      const mockIndex = {
        search: vi.fn().mockRejectedValue(new Error('Search failed'))
      };
      algoliasearch.default.mockReturnValue({
        initIndex: vi.fn().mockReturnValue(mockIndex)
      });

      await expect(searchService.searchProducts('honey')).rejects.toThrow('Search failed');
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return autocomplete suggestions', async () => {
      const mockSuggestions = {
        hits: [
          { query: 'himalayan honey', nbHits: 5 },
          { query: 'himalayan salt', nbHits: 3 }
        ]
      };

      const algoliasearch = await import('algoliasearch');
      const mockIndex = {
        search: vi.fn().mockResolvedValue(mockSuggestions)
      };
      algoliasearch.default.mockReturnValue({
        initIndex: vi.fn().mockReturnValue(mockIndex)
      });

      const result = await searchService.getSearchSuggestions('himalayan');

      expect(result).toHaveLength(2);
      expect(result[0].query).toBe('himalayan honey');
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

      const algoliasearch = await import('algoliasearch');
      const mockIndex = {
        saveObject: vi.fn().mockResolvedValue({ objectID: '1' })
      };
      algoliasearch.default.mockReturnValue({
        initIndex: vi.fn().mockReturnValue(mockIndex)
      });

      await searchService.indexProduct(product);

      expect(mockIndex.saveObject).toHaveBeenCalledWith({
        objectID: '1',
        name: 'Test Product',
        price: 299,
        category: 'test'
      });
    });
  });

  describe('analytics', () => {
    it('should track search queries', () => {
      const query = 'himalayan honey';
      searchService.trackSearch(query);

      expect(searchService.getSearchAnalytics().queries).toContain(query);
    });

    it('should track click events', () => {
      const productId = 'product-1';
      const query = 'honey';
      
      searchService.trackClick(productId, query);

      const analytics = searchService.getSearchAnalytics();
      expect(analytics.clicks).toHaveLength(1);
      expect(analytics.clicks[0].productId).toBe(productId);
    });
  });
});