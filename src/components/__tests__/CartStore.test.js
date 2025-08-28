import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { onSnapshot } from 'firebase/firestore'
import { useCartStore } from '../../store/cartStore'

// Mock onSnapshot
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
  collection: vi.fn(),
}));

// Mock Firebase
vi.mock('../../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn()
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { uid: 'test-user-123' }
    }))
  }
}))

describe('CartStore Real-time Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useCartStore.setState({ cart: [], loading: false, error: null, unsubscribe: null });
  });

  afterEach(() => {
    // Clean up any subscriptions
    const { unsubscribeFromCart } = useCartStore.getState();
    unsubscribeFromCart();
  });

  it('should initialize with empty cart', () => {
    const { cart, loading, error } = useCartStore.getState();
    
    expect(cart).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  it('should add product to cart', () => {
    const { addToCart, cart } = useCartStore.getState();
    const testProduct = {
      id: '1',
      name: 'Test Product',
      price: 299,
      quantityAvailable: 10
    };
    
    addToCart(testProduct, 2);
    
    const updatedCart = useCartStore.getState().cart;
    expect(updatedCart).toHaveLength(1);
    expect(updatedCart[0]).toEqual({
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

  it('should handle real-time subscription setup', () => {
    const { onSnapshot } = require('firebase/firestore');
    const mockUnsubscribe = vi.fn();
    onSnapshot.mockReturnValue(mockUnsubscribe);
    
    const { subscribeToCart } = useCartStore.getState();
    const unsubscribe = subscribeToCart();
    
    expect(onSnapshot).toHaveBeenCalled();
    expect(typeof unsubscribe).toBe('function');
  });

  it('should handle real-time cart updates', () => {
    const { onSnapshot } = require('firebase/firestore');
    let snapshotCallback;
    
    onSnapshot.mockImplementation((docRef, callback) => {
      snapshotCallback = callback;
      return vi.fn(); // mock unsubscribe
    });
    
    const { subscribeToCart } = useCartStore.getState();
    subscribeToCart();
    
    // Simulate Firestore update
    const mockDoc = {
      exists: () => true,
      data: () => ({
        items: [
          { id: '1', name: 'Updated Product', price: 299, quantity: 3 }
        ]
      })
    };
    
    snapshotCallback(mockDoc);
    
    const cart = useCartStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('should handle subscription cleanup', () => {
    const mockUnsubscribe = vi.fn();
    useCartStore.setState({ unsubscribe: mockUnsubscribe });
    
    const { unsubscribeFromCart } = useCartStore.getState();
    unsubscribeFromCart();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(useCartStore.getState().unsubscribe).toBe(null);
  });
});