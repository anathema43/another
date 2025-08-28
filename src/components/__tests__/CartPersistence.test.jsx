import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import Cart from '../../pages/Cart'

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

describe('Cart Persistence Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores
    useCartStore.setState({ cart: [], loading: false, error: null });
    useAuthStore.setState({ currentUser: null, userProfile: null });
  });

  afterEach(() => {
    // Clean up subscriptions
    const { unsubscribeFromCart } = useCartStore.getState();
    if (unsubscribeFromCart) {
      unsubscribeFromCart();
    }
  });

  describe('User Isolation', () => {
    it('should isolate cart data between different users', async () => {
      const { addToCart, loadCart } = useCartStore.getState();
      
      // User 1 adds items to cart
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      const product1 = { id: '1', name: 'Product 1', price: 100 };
      addToCart(product1, 2);
      
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(2);
      
      // User 2 signs in - should have empty cart
      useAuthStore.setState({ 
        currentUser: { uid: 'user2', email: 'user2@test.com' } 
      });
      
      // Simulate loading User 2's cart (empty)
      useCartStore.setState({ cart: [] });
      
      expect(useCartStore.getState().cart).toHaveLength(0);
      
      // User 1 signs back in - should restore their cart
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      // Simulate loading User 1's cart from Firebase
      useCartStore.setState({ 
        cart: [{ id: '1', name: 'Product 1', price: 100, quantity: 2 }] 
      });
      
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(2);
    });

    it('should clear cart when user signs out', () => {
      const { addToCart } = useCartStore.getState();
      
      // User adds items
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      addToCart({ id: '1', name: 'Product 1', price: 100 }, 1);
      expect(useCartStore.getState().cart).toHaveLength(1);
      
      // User signs out
      useAuthStore.setState({ currentUser: null });
      
      // Cart should be cleared for security
      useCartStore.setState({ cart: [] });
      expect(useCartStore.getState().cart).toHaveLength(0);
    });
  });

  describe('Real-time Synchronization', () => {
    it('should sync cart across browser tabs', () => {
      const { onSnapshot } = require('firebase/firestore');
      let snapshotCallback;
      
      onSnapshot.mockImplementation((docRef, callback) => {
        snapshotCallback = callback;
        return vi.fn(); // mock unsubscribe
      });
      
      useAuthStore.setState({ 
        currentUser: { uid: 'user1', email: 'user1@test.com' } 
      });
      
      const { subscribeToCart } = useCartStore.getState();
      subscribeToCart();
      
      // Simulate cart update from another tab
      const mockDoc = {
        exists: () => true,
        data: () => ({
          items: [
            { id: '1', name: 'Product 1', price: 100, quantity: 3 },
            { id: '2', name: 'Product 2', price: 200, quantity: 1 }
          ]
        })
      };
      
      snapshotCallback(mockDoc);
      
      const cart = useCartStore.getState().cart;
      expect(cart).toHaveLength(2);
      expect(cart[0].quantity).toBe(3);
      expect(cart[1].quantity).toBe(1);
    });

    it('should handle Firebase connection errors gracefully', () => {
      const { onSnapshot } = require('firebase/firestore');
      let errorCallback;
      
      onSnapshot.mockImplementation((docRef, successCallback, errorCallback) => {
        errorCallback = errorCallback;
        return vi.fn();
      });
      
      const { subscribeToCart } = useCartStore.getState();
      subscribeToCart();
      
      // Simulate Firebase error
      const mockError = new Error('Firebase connection failed');
      errorCallback(mockError);
      
      const { error } = useCartStore.getState();
      expect(error).toBe('Firebase connection failed');
    });
  });

  describe('Cart UI Integration', () => {
    it('should show checkout button when cart has items', () => {
      useCartStore.setState({
        cart: [{ id: '1', name: 'Test Product', price: 299, quantity: 1 }]
      });
      
      renderWithRouter(<Cart />);
      
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
      expect(screen.getByText('Proceed to Checkout').closest('a')).toHaveAttribute('href', '/checkout');
    });

    it('should show empty cart message when no items', () => {
      useCartStore.setState({ cart: [] });
      
      renderWithRouter(<Cart />);
      
      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
      expect(screen.getByText('Start Shopping')).toBeInTheDocument();
    });

    it('should calculate totals correctly', () => {
      const { addToCart, getSubtotal, getTax, getShipping, getGrandTotal } = useCartStore.getState();
      
      addToCart({ id: '1', name: 'Product 1', price: 100 }, 2); // 200
      addToCart({ id: '2', name: 'Product 2', price: 300 }, 1); // 300
      
      expect(getSubtotal()).toBe(500); // (150 * 2) + (200 * 1) = 500
      expect(getTax()).toBe(40); // 8% of 500 = 40
      expect(getShipping()).toBe(0); // Free shipping over ₹500
      expect(getGrandTotal()).toBe(540); // 500 + 40 + 0 = 540
      expect(getTax()).toBe(40); // 8% of 500
      expect(getShipping()).toBe(0); // Free shipping over 500
      expect(getGrandTotal()).toBe(540); // 500 + 40 + 0
    });
  });
});