import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AdminRoute from '../AdminRoute'

// Mock the auth store
const mockAuthStore = {
  currentUser: null,
  userProfile: null,
  loading: false
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminRoute Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockAuthStore.currentUser = null;
    mockAuthStore.userProfile = null;
    mockAuthStore.loading = false;
  });

  it('should redirect to login when user is not authenticated', () => {
    renderWithRouter(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );
    
    // Should not render admin content
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should deny access to non-admin users', () => {
    mockAuthStore.currentUser = { uid: 'user123', email: 'user@example.com' };
    mockAuthStore.userProfile = { role: 'customer' };
    
    renderWithRouter(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should allow access to admin users', () => {
    mockAuthStore.currentUser = { uid: 'admin123', email: 'admin@example.com' };
    mockAuthStore.userProfile = { role: 'admin' };
    
    renderWithRouter(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('should show loading state while checking authentication', () => {
    mockAuthStore.loading = true;
    
    renderWithRouter(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not be vulnerable to client-side role manipulation', () => {
    // Simulate attempt to manipulate user role on client-side
    mockAuthStore.currentUser = { uid: 'user123', email: 'user@example.com' };
    mockAuthStore.userProfile = { role: 'customer' };
    
    // Try to manipulate the role
    Object.defineProperty(mockAuthStore.userProfile, 'role', {
      value: 'admin',
      writable: true
    });
    
    renderWithRouter(
      <AdminRoute>
        <div>Admin Content</div>
      </AdminRoute>
    );
    
    // Should still deny access because server-side validation would prevent this
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});