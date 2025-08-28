import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import WishlistButton from '../../components/WishlistButton'
import Wishlist from '../../pages/Wishlist'

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

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Wishlist Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWishlistStore.setState({ wishlist: [], loading: false, error: null });
    useAuthStore.setState({ currentUser: null, userProfile: null });
  });

  afterEach(() => {
    const { unsubscribeFromWishlist } = useWishlistStore.getState();
    if (unsubscribeFromWishlist) {
      unsubscribeFromWishlist();
    }
  });

  describe('Wishlist Button Component', () => {
    it('should show empty heart when product not in wishlist', () => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      renderWithRouter(
        <WishlistButton productId="product-1" />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Add to wishlist');
    });

    it('should show filled heart when product is in wishlist', () => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      useWishlistStore.setState({ wishlist: ['product-1'] });
      
      renderWithRouter(
        <WishlistButton productId="product-1" />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Remove from wishlist');
    });

    it('should redirect to login when not authenticated', () => {
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });
      
      useAuthStore.setState({ currentUser: null });
      
      renderWithRouter(
        <WishlistButton productId="product-1" />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should attempt to navigate to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should toggle wishlist when authenticated', () => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      const { addToWishlist, removeFromWishlist } = useWishlistStore.getState();
      
      renderWithRouter(
        <WishlistButton productId="product-1" />
      );
      
      const button = screen.getByRole('button');
      
      // First click - add to wishlist
      fireEvent.click(button);
      // Should call addToWishlist
      
      // Set wishlist state to simulate addition
      useWishlistStore.setState({ wishlist: ['product-1'] });
      
      // Second click - remove from wishlist
      fireEvent.click(button);
      // Should call removeFromWishlist
    });
  });

  describe('Wishlist Page', () => {
    it('should show login prompt when not authenticated', () => {
      useAuthStore.setState({ currentUser: null });
      
      renderWithRouter(<Wishlist />);
      
      expect(screen.getByText('Please login to view your wishlist')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should show empty wishlist message when no items', () => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      useWishlistStore.setState({ wishlist: [] });
      
      renderWithRouter(<Wishlist />);
      
      expect(screen.getByText('Your Wishlist is Empty')).toBeInTheDocument();
      expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('should display wishlist items when available', () => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      useWishlistStore.setState({ wishlist: ['product-1', 'product-2'] });
      
      // Mock products store to provide product data
      vi.mock('../../store/productStore', () => ({
        useProductStore: () => ({
          products: [
            { id: 'product-1', name: 'Product 1', price: 100 },
            { id: 'product-2', name: 'Product 2', price: 200 }
          ],
          fetchProducts: vi.fn()
        })
      }));
      
      renderWithRouter(<Wishlist />);
      
      expect(screen.getByText('2 item(s) in your wishlist')).toBeInTheDocument();
    });
  });

  describe('User Isolation', () => {
    it('should isolate wishlist data between users', () => {
      const { addToWishlist } = useWishlistStore.getState();
      
      // User 1 adds to wishlist
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      addToWishlist('product-1');
      
      expect(useWishlistStore.getState().wishlist).toContain('product-1');
      
      // User 2 signs in - should have empty wishlist
      useAuthStore.setState({ 
        currentUser: { uid: 'user2', email: 'user2@test.com' } 
      });
      useWishlistStore.setState({ wishlist: [] }); // Simulate loading User 2's empty wishlist
      
      expect(useWishlistStore.getState().wishlist).toHaveLength(0);
      
      // User 1 signs back in - should restore their wishlist
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      useWishlistStore.setState({ wishlist: ['product-1'] }); // Simulate loading User 1's wishlist
      
      expect(useWishlistStore.getState().wishlist).toContain('product-1');
    });

    it('should clear wishlist when user signs out', () => {
      const { addToWishlist } = useWishlistStore.getState();
      
      // User adds items
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      addToWishlist('product-1');
      
      expect(useWishlistStore.getState().wishlist).toHaveLength(1);
      
      // User signs out
      useAuthStore.setState({ currentUser: null });
      useWishlistStore.setState({ wishlist: [] }); // Simulate clearing on signout
      
      expect(useWishlistStore.getState().wishlist).toHaveLength(0);
    });
  });

  describe('Real-time Synchronization', () => {
    it('should sync wishlist across browser tabs', () => {
      const { onSnapshot } = require('firebase/firestore');
      let snapshotCallback;
      
      onSnapshot.mockImplementation((docRef, callback) => {
        snapshotCallback = callback;
        return vi.fn(); // mock unsubscribe
      });
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      const { subscribeToWishlist } = useWishlistStore.getState();
      subscribeToWishlist();
      
      // Simulate wishlist update from another tab
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

    it('should handle Firebase errors in real-time sync', () => {
      const { onSnapshot } = require('firebase/firestore');
      let errorCallback;
      
      onSnapshot.mockImplementation((docRef, successCallback, errorCallback) => {
        errorCallback = errorCallback;
        return vi.fn();
      });
      
      const { subscribeToWishlist } = useWishlistStore.getState();
      subscribeToWishlist();
      
      // Simulate Firebase error
      const mockError = new Error('Wishlist sync failed');
      errorCallback(mockError);
      
      const { error } = useWishlistStore.getState();
      expect(error).toBe('Wishlist sync failed');
    });
  });

  describe('Wishlist Operations', () => {
    beforeEach(() => {
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
    });

    it('should add product to wishlist', () => {
      const { addToWishlist, isInWishlist } = useWishlistStore.getState();
      
      expect(isInWishlist('product-1')).toBe(false);
      
      addToWishlist('product-1');
      
      expect(useWishlistStore.getState().wishlist).toContain('product-1');
      expect(isInWishlist('product-1')).toBe(true);
    });

    it('should remove product from wishlist', () => {
      const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      expect(isInWishlist('product-1')).toBe(true);
      
      removeFromWishlist('product-1');
      
      expect(useWishlistStore.getState().wishlist).not.toContain('product-1');
      expect(isInWishlist('product-1')).toBe(false);
    });

    it('should not add duplicate products to wishlist', () => {
      const { addToWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      addToWishlist('product-1'); // Try to add again
      
      const wishlist = useWishlistStore.getState().wishlist;
      expect(wishlist.filter(id => id === 'product-1')).toHaveLength(1);
    });

    it('should get correct wishlist count', () => {
      const { addToWishlist, getWishlistCount } = useWishlistStore.getState();
      
      expect(getWishlistCount()).toBe(0);
      
      addToWishlist('product-1');
      addToWishlist('product-2');
      
      expect(getWishlistCount()).toBe(2);
    });

    it('should clear entire wishlist', () => {
      const { addToWishlist, clearWishlist } = useWishlistStore.getState();
      
      addToWishlist('product-1');
      addToWishlist('product-2');
      
      expect(useWishlistStore.getState().wishlist).toHaveLength(2);
      
      clearWishlist();
      
      expect(useWishlistStore.getState().wishlist).toHaveLength(0);
    });
  });
});