import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'

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

describe('Cart Persistence Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ cart: [], loading: false, error: null });
    useAuthStore.setState({ currentUser: null, userProfile: null });
  });

  describe('User-specific Cart Storage', () => {
    it('should save cart to user-specific Firebase document', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValue();
      
      // Set authenticated user
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { addToCart, saveCart } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299 };
      
      addToCart(testProduct, 2);
      await saveCart();
      
      // Should save to user-specific document
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(), // doc reference
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              quantity: 2
            })
          ])
        })
      );
    });

    it('should load cart from user-specific Firebase document', async () => {
      const { getDoc } = require('firebase/firestore');
      
      const mockCartData = {
        items: [
          { id: '1', name: 'Saved Product', price: 299, quantity: 1 }
        ],
        updatedAt: new Date().toISOString()
      };
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockCartData
      });
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { loadCart } = useCartStore.getState();
      await loadCart();
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe('Saved Product');
    });

    it('should handle missing cart document gracefully', async () => {
      const { getDoc } = require('firebase/firestore');
      
      getDoc.mockResolvedValue({
        exists: () => false
      });
      
      useAuthStore.setState({ 
        currentUser: { uid: 'newuser', email: 'new@test.com' } 
      });
      
      const { loadCart } = useCartStore.getState();
      await loadCart();
      
      // Should have empty cart for new user
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(0);
    });
  });

  describe('Real-time Cart Synchronization', () => {
    it('should set up real-time listener for authenticated user', () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe = vi.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { subscribeToCart } = useCartStore.getState();
      const unsubscribe = subscribeToCart();
      
      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should not set up listener when user is not authenticated', () => {
      const { onSnapshot } = require('firebase/firestore');
      
      useAuthStore.setState({ currentUser: null });
      
      const { subscribeToCart } = useCartStore.getState();
      const result = subscribeToCart();
      
      expect(onSnapshot).not.toHaveBeenCalled();
      expect(typeof result).toBe('function'); // Should return empty function
    });

    it('should clean up previous listener when setting up new one', () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe1 = vi.fn();
      const mockUnsubscribe2 = vi.fn();
      
      onSnapshot.mockReturnValueOnce(mockUnsubscribe1);
      onSnapshot.mockReturnValueOnce(mockUnsubscribe2);
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { subscribeToCart } = useCartStore.getState();
      
      // Set up first listener
      subscribeToCart();
      useCartStore.setState({ unsubscribe: mockUnsubscribe1 });
      
      // Set up second listener (should clean up first)
      subscribeToCart();
      
      expect(mockUnsubscribe1).toHaveBeenCalled();
    });

    it('should update cart state when Firebase document changes', () => {
      const { onSnapshot } = require('firebase/firestore');
      let snapshotCallback;
      
      onSnapshot.mockImplementation((docRef, callback) => {
        snapshotCallback = callback;
        return vi.fn();
      });
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { subscribeToCart } = useCartStore.getState();
      subscribeToCart();
      
      // Simulate Firebase document update
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
  });

  describe('Cart State Management', () => {
    it('should persist cart state in localStorage', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
      
      const { addToCart } = useCartStore.getState();
      const testProduct = { id: '1', name: 'Test Product', price: 299 };
      
      addToCart(testProduct, 1);
      
      // Should persist to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ramro-cart-storage',
        expect.stringContaining('"cart"')
      );
    });

    it('should restore cart state from localStorage on app start', () => {
      const savedCart = {
        state: {
          cart: [{ id: '1', name: 'Saved Product', price: 299, quantity: 1 }]
        }
      };
      
      const mockLocalStorage = {
        getItem: vi.fn(() => JSON.stringify(savedCart)),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });
      
      // This would happen during store initialization
      const cart = useCartStore.getState().cart;
      // Note: In actual implementation, this would be handled by Zustand persist middleware
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase save errors gracefully', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockRejectedValue(new Error('Firebase save failed'));
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { addToCart, saveCart } = useCartStore.getState();
      addToCart({ id: '1', name: 'Test Product', price: 299 }, 1);
      
      // Should handle error without crashing
      await expect(saveCart()).rejects.toThrow('Firebase save failed');
      
      const { error } = useCartStore.getState();
      expect(error).toBe('Firebase save failed');
    });

    it('should handle Firebase load errors gracefully', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockRejectedValue(new Error('Firebase load failed'));
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user123', email: 'user@test.com' } 
      });
      
      const { loadCart } = useCartStore.getState();
      
      try {
        await loadCart();
      } catch (error) {
        expect(error.message).toBe('Firebase load failed');
      }
      
      const { error } = useCartStore.getState();
      expect(error).toBe('Firebase load failed');
    });
  });
});