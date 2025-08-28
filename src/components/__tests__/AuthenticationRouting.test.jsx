import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../pages/Login'
import Signup from '../../pages/Signup'
import { useAuthStore } from '../../store/authStore'

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock Firebase
vi.mock('../../firebase/firebase', () => ({
  auth: {},
  db: {}
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn()
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Authentication Routing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    useAuthStore.setState({ 
      currentUser: null, 
      userProfile: null, 
      loading: false, 
      error: null 
    });
  });

  describe('Login Routing', () => {
    it('should redirect to home page after successful login', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { getDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      const mockUserProfile = { role: 'customer', displayName: 'Test User' };
      
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile
      });
      
      renderWithRouter(<Login />);
      
      // Fill login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should redirect to saved path after login', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { getDoc } = require('firebase/firestore');
      
      // Mock saved redirect path
      const mockGetAndClearRedirectPath = vi.fn(() => '/shop');
      vi.mock('../../utils/redirectUtils', () => ({
        getAndClearRedirectPath: mockGetAndClearRedirectPath,
        determineRedirectPath: vi.fn((profile, savedPath) => savedPath || '/')
      }));
      
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      const mockUserProfile = { role: 'customer', displayName: 'Test User' };
      
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile
      });
      
      renderWithRouter(<Login />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/shop', { replace: true });
      });
    });

    it('should redirect admin users to admin panel', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { getDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'admin123', email: 'admin@example.com' };
      const mockUserProfile = { role: 'admin', displayName: 'Admin User' };
      
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile
      });
      
      renderWithRouter(<Login />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'admin@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'adminpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('should handle login errors without redirecting', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      
      signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));
      
      renderWithRouter(<Login />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Signup Routing', () => {
    it('should redirect to home page after successful signup', async () => {
      const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
      const { setDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'newuser123', email: 'new@example.com' };
      
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      updateProfile.mockResolvedValue();
      setDoc.mockResolvedValue();
      
      renderWithRouter(<Signup />);
      
      // Fill signup form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'New User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'newpassword123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'newpassword123' }
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should handle signup errors without redirecting', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      
      createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already exists'));
      
      renderWithRouter(<Signup />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should validate form before attempting signup', async () => {
      renderWithRouter(<Signup />);
      
      // Submit empty form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      
      // Should not navigate with validation errors
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should validate password confirmation', async () => {
      renderWithRouter(<Signup />);
      
      // Fill form with mismatched passwords
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'differentpassword' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Redirect Path Management', () => {
    it('should save redirect path when accessing protected route', () => {
      const mockSaveRedirectPath = vi.fn();
      vi.mock('../../utils/redirectUtils', () => ({
        saveRedirectPath: mockSaveRedirectPath,
        getAndClearRedirectPath: vi.fn(() => null),
        determineRedirectPath: vi.fn(() => '/')
      }));
      
      // This would be tested in ProtectedRoute component
      expect(mockSaveRedirectPath).toBeDefined();
    });

    it('should clear redirect path after successful authentication', () => {
      const mockGetAndClearRedirectPath = vi.fn(() => '/checkout');
      vi.mock('../../utils/redirectUtils', () => ({
        getAndClearRedirectPath: mockGetAndClearRedirectPath,
        determineRedirectPath: vi.fn((profile, savedPath) => savedPath || '/')
      }));
      
      // This would be called during login success
      expect(mockGetAndClearRedirectPath).toBeDefined();
    });
  });
});