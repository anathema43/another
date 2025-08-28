import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from '../ProductCard'

// Mock the stores
vi.mock('../../store/cartStore', () => ({
  useCartStore: () => ({
    addToCart: vi.fn(),
    updateQuantity: vi.fn(),
    getItemQuantity: vi.fn(() => 0)
  })
}))

vi.mock('../../store/wishlistStore', () => ({
  useWishlistStore: () => ({
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    isInWishlist: vi.fn(() => false)
  })
}))

const mockProduct = {
  id: '1',
  name: 'Test Himalayan Product',
  description: 'A test product from the mountains',
  price: 299,
  image: 'https://example.com/test-product.jpg',
  quantityAvailable: 10,
  rating: 4.5,
  category: 'test'
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Himalayan Product')).toBeInTheDocument();
    expect(screen.getByText('A test product from the mountains')).toBeInTheDocument();
    expect(screen.getByText('₹299')).toBeInTheDocument();
    expect(screen.getByAltText('Test Himalayan Product')).toBeInTheDocument();
  });

  it('displays add to cart button when quantity is 0', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const addButton = screen.getByText('Add to Cart');
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it('shows out of stock when quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, quantityAvailable: 0 };
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeDisabled();
  });

  it('displays product rating', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    // Check if rating stars are rendered (assuming ReviewStars component renders stars)
    const ratingElement = screen.getByTestId('review-stars');
    expect(ratingElement).toBeInTheDocument();
  });

  it('has working view details link', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const viewDetailsLink = screen.getByText('View Details');
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink.closest('a')).toHaveAttribute('href', '/products/1');
  });

  it('shows low stock warning when appropriate', () => {
    const lowStockProduct = { ...mockProduct, quantityAvailable: 3 };
    renderWithRouter(<ProductCard product={lowStockProduct} />);
    
    expect(screen.getByText('Only 3 left in stock!')).toBeInTheDocument();
  });
});