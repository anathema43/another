import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Cart from '../../pages/Cart'
import { useCartStore } from '../../store/cartStore'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Checkout Button Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ cart: [], loading: false, error: null });
  });

  describe('Checkout Button Visibility', () => {
    it('should show checkout button when cart has items', () => {
      useCartStore.setState({
        cart: [
          { id: '1', name: 'Test Product', price: 299, quantity: 1, image: 'test.jpg' }
        ]
      });
      
      renderWithRouter(<Cart />);
      
      const checkoutButton = screen.getByText('Proceed to Checkout');
      expect(checkoutButton).toBeInTheDocument();
      expect(checkoutButton.closest('a')).toHaveAttribute('href', '/checkout');
    });

    it('should not show checkout button when cart is empty', () => {
      useCartStore.setState({ cart: [] });
      
      renderWithRouter(<Cart />);
      
      expect(screen.queryByText('Proceed to Checkout')).not.toBeInTheDocument();
      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
      expect(screen.getByText('Start Shopping')).toBeInTheDocument();
    });

    it('should show correct total on checkout button', () => {
      useCartStore.setState({
        cart: [
          { id: '1', name: 'Product 1', price: 100, quantity: 2, image: 'test1.jpg' },
          { id: '2', name: 'Product 2', price: 300, quantity: 1, image: 'test2.jpg' }
        ]
      });
      
      renderWithRouter(<Cart />);
      
      // Should show total including tax and shipping
      const total = 500 + (500 * 0.08) + 0; // subtotal + tax + shipping (free over 500)
      expect(screen.getByText(`Total: ₹${total.toLocaleString('en-IN')}`)).toBeInTheDocument();
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate subtotal correctly', () => {
      const { addToCart, getSubtotal } = useCartStore.getState();
      
      addToCart({ id: '1', name: 'Product 1', price: 150, quantityAvailable: 10 }, 2);
      addToCart({ id: '2', name: 'Product 2', price: 200, quantityAvailable: 10 }, 1);
      
      expect(getSubtotal()).toBe(500); // (150 * 2) + (200 * 1)
    });

    it('should calculate tax correctly', () => {
      const { addToCart, getTax } = useCartStore.getState();
      
      addToCart({ id: '1', name: 'Product 1', price: 100, quantityAvailable: 10 }, 1);
      
      expect(getTax()).toBe(8); // 8% of 100
    });

    it('should apply free shipping over threshold', () => {
      const { addToCart, getShipping } = useCartStore.getState();
      
      // Order over ₹500 - should be free shipping
      addToCart({ id: '1', name: 'Expensive Product', price: 600, quantityAvailable: 10 }, 1);
      expect(getShipping()).toBe(0);
      
      // Reset cart
      useCartStore.setState({ cart: [] });
      
      // Order under ₹500 - should charge shipping
      addToCart({ id: '2', name: 'Cheap Product', price: 100, quantityAvailable: 10 }, 1);
      expect(getShipping()).toBe(50);
    });

    it('should calculate grand total correctly', () => {
      const { addToCart, getGrandTotal } = useCartStore.getState();
      
      addToCart({ id: '1', name: 'Product', price: 400, quantityAvailable: 10 }, 1);
      
      const subtotal = 400;
      const tax = 400 * 0.08; // 32
      const shipping = 50; // Under ₹500 threshold
      const expectedTotal = subtotal + tax + shipping; // 482
      
      expect(getGrandTotal()).toBe(expectedTotal);
    });
  });

  describe('Cart Item Management', () => {
    it('should display cart items correctly', () => {
      useCartStore.setState({
        cart: [
          { 
            id: '1', 
            name: 'Darjeeling Pickle', 
            price: 299, 
            quantity: 2, 
            image: 'pickle.jpg',
            quantityAvailable: 10
          }
        ]
      });
      
      renderWithRouter(<Cart />);
      
      expect(screen.getByText('Darjeeling Pickle')).toBeInTheDocument();
      expect(screen.getByText('₹299')).toBeInTheDocument();
      expect(screen.getByText('₹598')).toBeInTheDocument(); // 299 * 2
    });

    it('should show low stock warning', () => {
      useCartStore.setState({
        cart: [
          { 
            id: '1', 
            name: 'Low Stock Product', 
            price: 299, 
            quantity: 1, 
            image: 'test.jpg',
            quantityAvailable: 3
          }
        ]
      });
      
      renderWithRouter(<Cart />);
      
      expect(screen.getByText('Only 3 left in stock')).toBeInTheDocument();
    });

    it('should allow removing items from cart', () => {
      const mockRemoveFromCart = vi.fn();
      useCartStore.setState({
        cart: [
          { id: '1', name: 'Test Product', price: 299, quantity: 1, image: 'test.jpg' }
        ]
      });
      
      // Mock the remove function
      useCartStore.getState().removeFromCart = mockRemoveFromCart;
      
      renderWithRouter(<Cart />);
      
      const removeButton = screen.getByTitle('Remove item');
      fireEvent.click(removeButton);
      
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
    });

    it('should allow clearing entire cart', () => {
      const mockClearCart = vi.fn();
      useCartStore.setState({
        cart: [
          { id: '1', name: 'Test Product', price: 299, quantity: 1, image: 'test.jpg' }
        ]
      });
      
      useCartStore.getState().clearCart = mockClearCart;
      
      renderWithRouter(<Cart />);
      
      const clearButton = screen.getByText('Clear All Items');
      fireEvent.click(clearButton);
      
      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  describe('Navigation Links', () => {
    it('should have working continue shopping link', () => {
      useCartStore.setState({
        cart: [
          { id: '1', name: 'Test Product', price: 299, quantity: 1, image: 'test.jpg' }
        ]
      });
      
      renderWithRouter(<Cart />);
      
      const continueShoppingLink = screen.getByText('Continue Shopping');
      expect(continueShoppingLink.closest('a')).toHaveAttribute('href', '/shop');
    });

    it('should have working start shopping link when cart is empty', () => {
      useCartStore.setState({ cart: [] });
      
      renderWithRouter(<Cart />);
      
      const startShoppingLink = screen.getByText('Start Shopping');
      expect(startShoppingLink.closest('a')).toHaveAttribute('href', '/shop');
    });
  });
});