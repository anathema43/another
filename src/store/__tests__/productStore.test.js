import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProductStore } from '../productStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
}))

describe('ProductStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useProductStore.setState({ 
      products: [], 
      featuredProducts: [], 
      categories: [], 
      searchResults: [], 
      loading: false, 
      error: null 
    });
  });

  it('should initialize with empty state', () => {
    const { products, featuredProducts, loading, error } = useProductStore.getState();
    
    expect(products).toEqual([]);
    expect(featuredProducts).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('fetchProducts functionality', () => {
    it('should fetch products successfully', async () => {
      const { getDocs } = require('firebase/firestore');
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 299, category: 'honey' },
        { id: '2', name: 'Product 2', price: 399, category: 'pickle' }
      ];
      
      getDocs.mockResolvedValue({
        docs: mockProducts.map(product => ({
          id: product.id,
          data: () => ({ name: product.name, price: product.price, category: product.category })
        }))
      });
      
      const { fetchProducts } = useProductStore.getState();
      await fetchProducts();
      
      const { products, categories, loading } = useProductStore.getState();
      expect(products).toHaveLength(2);
      expect(categories).toContain('honey');
      expect(categories).toContain('pickle');
      expect(loading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));
      
      const { fetchProducts } = useProductStore.getState();
      
      await expect(fetchProducts()).rejects.toThrow('Network error');
      
      const { error, loading } = useProductStore.getState();
      expect(error).toBe('Network error');
      expect(loading).toBe(false);
    });
  });

  describe('searchProducts functionality', () => {
    beforeEach(() => {
      // Set up initial products
      useProductStore.setState({
        products: [
          { id: '1', name: 'Himalayan Honey', description: 'Pure honey', price: 499, category: 'honey' },
          { id: '2', name: 'Darjeeling Pickle', description: 'Spicy pickle', price: 299, category: 'pickle' },
          { id: '3', name: 'Wild Honey', description: 'Forest honey', price: 599, category: 'honey' }
        ]
      });
    });

    it('should search products by name', () => {
      const { searchProducts } = useProductStore.getState();
      const results = searchProducts('honey');
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toContain('Honey');
      expect(results[1].name).toContain('Honey');
    });

    it('should filter products by category', () => {
      const { searchProducts } = useProductStore.getState();
      const results = searchProducts('', 'honey');
      
      expect(results).toHaveLength(2);
      expect(results.every(p => p.category === 'honey')).toBe(true);
    });

    it('should sort products by price', () => {
      const { searchProducts } = useProductStore.getState();
      const results = searchProducts('', 'all', 'price-low');
      
      expect(results[0].price).toBeLessThanOrEqual(results[1].price);
      expect(results[1].price).toBeLessThanOrEqual(results[2].price);
    });
  });

  describe('product management', () => {
    it('should add new product', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'new-product-id' });
      
      const newProduct = {
        name: 'New Product',
        description: 'Test product',
        price: 399,
        category: 'spices'
      };
      
      const { addProduct } = useProductStore.getState();
      await addProduct(newProduct);
      
      expect(addDoc).toHaveBeenCalled();
      
      const { products } = useProductStore.getState();
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('New Product');
    });

    it('should update existing product', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();
      
      // Set initial state
      useProductStore.setState({
        products: [{ id: '1', name: 'Old Name', price: 299 }]
      });
      
      const { updateProduct } = useProductStore.getState();
      await updateProduct('1', { name: 'Updated Name', price: 399 });
      
      expect(updateDoc).toHaveBeenCalled();
      
      const { products } = useProductStore.getState();
      expect(products[0].name).toBe('Updated Name');
      expect(products[0].price).toBe(399);
    });

    it('should delete product', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue();
      
      // Set initial state
      useProductStore.setState({
        products: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' }
        ]
      });
      
      const { deleteProduct } = useProductStore.getState();
      await deleteProduct('1');
      
      expect(deleteDoc).toHaveBeenCalled();
      
      const { products } = useProductStore.getState();
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('2');
    });
  });

  describe('featured products', () => {
    it('should fetch featured products', async () => {
      const { getDocs } = require('firebase/firestore');
      const mockFeaturedProducts = [
        { id: '1', name: 'Featured Product', featured: true }
      ];
      
      getDocs.mockResolvedValue({
        docs: mockFeaturedProducts.map(product => ({
          id: product.id,
          data: () => product
        }))
      });
      
      const { fetchFeaturedProducts } = useProductStore.getState();
      await fetchFeaturedProducts();
      
      const { featuredProducts } = useProductStore.getState();
      expect(featuredProducts).toHaveLength(1);
      expect(featuredProducts[0].featured).toBe(true);
    });
  });
});