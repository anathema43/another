import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCartStore } from '../cartStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn()
}))

vi.mock('../authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { uid: 'test-user-123' }
    }))
  }
}))

describe('CartStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useCartStore.setState({ cart: [], loading: false, error: null, unsubscribe: null });
  });

  afterEach(() => {
    // Clean up any subscriptions
    const { unsubscribeFromCart } = useCartStore.getState();
    if (unsubscribeFromCart) {
      unsubscribeFromCart();
    }
  });

  it('should initialize with empty cart', () => {
    const { cart, loading, error } = useCartStore.getState();
    
    expect(cart).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('addToCart functionality', () => {
    it('should add product to cart', () => {
      const { addToCart } = useCartStore.getState();
      const testProduct = {
        id: '1',
        name: 'Test Product',
        price: 299,
        quantityAvailable: 10
      };
      
      addToCart(testProduct, 2);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0]).toEqual({
        ...testProduct,
        quantity: 2
      });
    });

    it('should update quantity for existing product', () => {
      const { addToCart } = useCartStore.getState();
      const testProduct = {
        id: '1',
        name: 'Test Product',
        price: 299,
        quantityAvailable: 10
      };
      
      // Add product twice
      addToCart(testProduct, 1);
      addToCart(testProduct, 1);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });
  });

  describe('removeFromCart functionality', () => {
    it('should remove product from cart', () => {
      const { addToCart, removeFromCart } = useCartStore.getState();
      const testProduct = {
        id: '1',
        name: 'Test Product',
        price: 299,
        quantityAvailable: 10
      };
      
      addToCart(testProduct, 1);
      removeFromCart('1');
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(0);
    });
  });

  describe('cart calculations', () => {
    it('should calculate total price correctly', () => {
      const { addToCart, getTotalPrice } = useCartStore.getState();
      const product1 = { id: '1', name: 'Product 1', price: 100, quantityAvailable: 10 };
      const product2 = { id: '2', name: 'Product 2', price: 200, quantityAvailable: 10 };
      
      addToCart(product1, 2); // 200
      addToCart(product2, 1); // 200
      
      expect(getTotalPrice()).toBe(400);
    });

    it('should calculate tax correctly', () => {
      const { addToCart, getTax } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 100, quantityAvailable: 10 };
      
      addToCart(testProduct, 1);
      
      expect(getTax()).toBe(8); // 8% of 100
    });

    it('should calculate shipping correctly', () => {
      const { addToCart, getShipping } = useCartStore.getState();
      
      // Test free shipping threshold
      const expensiveProduct = { id: '1', name: 'Expensive Product', price: 600, quantityAvailable: 10 };
      addToCart(expensiveProduct, 1);
      expect(getShipping()).toBe(0); // Free shipping over ₹500
      
      // Reset cart
      useCartStore.setState({ cart: [] });
      
      // Test paid shipping
      const cheapProduct = { id: '2', name: 'Cheap Product', price: 100, quantityAvailable: 10 };
      addToCart(cheapProduct, 1);
      expect(getShipping()).toBe(50); // ₹50 shipping under ₹500
    });
  });

  describe('cart utilities', () => {
    it('should get item quantity correctly', () => {
      const { addToCart, getItemQuantity } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299, quantityAvailable: 10 };
      
      expect(getItemQuantity('1')).toBe(0);
      
      addToCart(testProduct, 3);
      expect(getItemQuantity('1')).toBe(3);
    });

    it('should get total items correctly', () => {
      const { addToCart, getTotalItems } = useCartStore.getState();
      const product1 = { id: '1', name: 'Product 1', price: 100, quantityAvailable: 10 };
      const product2 = { id: '2', name: 'Product 2', price: 200, quantityAvailable: 10 };
      
      addToCart(product1, 2);
      addToCart(product2, 3);
      
      expect(getTotalItems()).toBe(5);
    });

    it('should clear cart correctly', () => {
      const { addToCart, clearCart } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299, quantityAvailable: 10 };
      
      addToCart(testProduct, 2);
      expect(useCartStore.getState().cart).toHaveLength(1);
      
      clearCart();
      expect(useCartStore.getState().cart).toHaveLength(0);
    });
  });

  describe('updateQuantity functionality', () => {
    it('should update quantity correctly', () => {
      const { addToCart, updateQuantity } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299, quantityAvailable: 10 };
      
      addToCart(testProduct, 1);
      updateQuantity('1', 5);
      
      const cart = useCartStore.getState().cart;
      expect(cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      const { addToCart, updateQuantity } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299, quantityAvailable: 10 };
      
      addToCart(testProduct, 1);
      updateQuantity('1', 0);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(0);
    });
  });
});