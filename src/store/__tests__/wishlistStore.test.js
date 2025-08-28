import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWishlistStore } from '../wishlistStore'

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

describe('WishlistStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useWishlistStore.setState({ wishlist: [], loading: false, error: null, unsubscribe: null });
  });

  afterEach(() => {
    // Clean up any subscriptions
    const { unsubscribeFromWishlist } = useWishlistStore.getState();
    if (unsubscribeFromWishlist) {
      unsubscribeFromWishlist();
    }
  });

  it('should initialize with empty wishlist', () => {
    const { wishlist, loading, error } = useWishlistStore.getState();
    
    expect(wishlist).toEqual([]);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('addToWishlist functionality', () => {
    it('should add product to wishlist', () => {
      const { addToWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist).toContain('product-1');
      expect(wishlist).toHaveLength(1);
    });

    it('should not add duplicate products', () => {
      const { addToWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      addToWishlist('product-1'); // Try to add again
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist).toHaveLength(1);
    });
  });

  describe('removeFromWishlist functionality', () => {
    it('should remove product from wishlist', () => {
      const { addToWishlist, removeFromWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      removeFromWishlist('product-1');
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist).not.toContain('product-1');
      expect(wishlist).toHaveLength(0);
    });
  });

  describe('toggleWishlist functionality', () => {
    it('should toggle product in wishlist', () => {
      const { toggleWishlist, isInWishlist } = useWishlistStore.getState();
      
      // Add product
      toggleWishlist('product-1');
      expect(isInWishlist('product-1')).toBe(true);
      
      // Remove product
      toggleWishlist('product-1');
      expect(isInWishlist('product-1')).toBe(false);
    });
  });

  describe('wishlist utilities', () => {
    it('should check if product is in wishlist', () => {
      const { addToWishlist, isInWishlist } = useWishlistStore.getState();
      
      expect(isInWishlist('product-1')).toBe(false);
      
      addToWishlist('product-1');
      expect(isInWishlist('product-1')).toBe(true);
    });

    it('should get wishlist count correctly', () => {
      const { addToWishlist, getWishlistCount } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      addToWishlist('product-2');
      
      expect(getWishlistCount()).toBe(2);
    });

    it('should clear entire wishlist', () => {
      const { addToWishlist, clearWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      addToWishlist('product-2');
      clearWishlist();
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist).toHaveLength(0);
    });
  });

  describe('real-time synchronization', () => {
    it('should handle real-time subscription setup', () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockUnsubscribe = vi.fn();
      onSnapshot.mockReturnValue(mockUnsubscribe);
      
      const { subscribeToWishlist } = useWishlistStore.getState();
      const unsubscribe = subscribeToWishlist();
      
      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle real-time wishlist updates', () => {
      const { onSnapshot } = require('firebase/firestore');
      let snapshotCallback;
      
      onSnapshot.mockImplementation((docRef, callback) => {
        snapshotCallback = callback;
        return vi.fn(); // mock unsubscribe
      });
      
      const { subscribeToWishlist } = useWishlistStore.getState();
      subscribeToWishlist();
      
      // Simulate Firestore update
      const mockDoc = {
        exists: () => true,
        data: () => ({
          productIds: ['product-1', 'product-2', 'product-3']
        })
      };
      
      snapshotCallback(mockDoc);
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist).toHaveLength(3);
      expect(wishlist).toContain('product-1');
      expect(wishlist).toContain('product-2');
      expect(wishlist).toContain('product-3');
    });

    it('should handle subscription cleanup', () => {
      const mockUnsubscribe = vi.fn();
      useWishlistStore.setState({ unsubscribe: mockUnsubscribe });
      
      const { unsubscribeFromWishlist } = useWishlistStore.getState();
      unsubscribeFromWishlist();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(useWishlistStore.getState().unsubscribe).toBe(null);
    });
  });
});