import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Admin from '../../pages/Admin'

// Mock Firebase
vi.mock('../../firebase/firebase', () => ({
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
  orderBy: vi.fn()
}))

// Mock auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    currentUser: { uid: 'admin-123', email: 'admin@test.com' },
    userProfile: { role: 'admin' }
  })
}))

// Mock stores
vi.mock('../../store/productStore', () => ({
  useProductStore: () => ({
    products: [],
    fetchProducts: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn()
  })
}))

vi.mock('../../store/orderStore', () => ({
  useOrderStore: () => ({
    orders: [],
    fetchOrders: vi.fn(),
    updateOrderStatus: vi.fn()
  })
}))

vi.mock('../../store/artisanStore', () => ({
  useArtisanStore: () => ({
    artisans: [],
    fetchArtisans: vi.fn(),
    deleteArtisan: vi.fn()
  })
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Story Management in Admin Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show stories tab in admin panel', () => {
    renderWithRouter(<Admin />);
    
    expect(screen.getByText('Stories')).toBeInTheDocument();
  });

  it('should display stories management interface', () => {
    renderWithRouter(<Admin />);
    
    // Click stories tab
    fireEvent.click(screen.getByText('Stories'));
    
    expect(screen.getByText('Story Management')).toBeInTheDocument();
    expect(screen.getByText('Add Story')).toBeInTheDocument();
  });

  it('should show stories table with proper columns', () => {
    renderWithRouter(<Admin />);
    
    fireEvent.click(screen.getByText('Stories'));
    
    // Check table headers
    expect(screen.getByText('Story')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should handle add story button click', () => {
    renderWithRouter(<Admin />);
    
    fireEvent.click(screen.getByText('Stories'));
    
    const addButton = screen.getByText('Add Story');
    fireEvent.click(addButton);
    
    // Should open story editor modal
    expect(screen.getByText('Create New Story')).toBeInTheDocument();
  });

  it('should handle story deletion', async () => {
    const { deleteDoc } = require('firebase/firestore');
    deleteDoc.mockResolvedValue();
    
    renderWithRouter(<Admin />);
    
    fireEvent.click(screen.getByText('Stories'));
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    // Simulate story deletion
    const deleteButton = screen.getByTitle('Delete Story');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  it('should show featured status in stories table', () => {
    renderWithRouter(<Admin />);
    
    fireEvent.click(screen.getByText('Stories'));
    
    // Should show featured badge for featured stories
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should handle story editing', () => {
    renderWithRouter(<Admin />);
    
    fireEvent.click(screen.getByText('Stories'));
    
    const editButton = screen.getByTitle('Edit Story');
    fireEvent.click(editButton);
    
    // Should open story editor
    expect(screen.getByText('Edit Story')).toBeInTheDocument();
  });
});