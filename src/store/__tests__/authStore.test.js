import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  auth: {},
  db: {}
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn()
}))

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({ 
      currentUser: null, 
      userProfile: null, 
      loading: false, 
      error: null 
    });
  });

  it('should initialize with null user state', () => {
    const { currentUser, userProfile, loading, error } = useAuthStore.getState();
    
    expect(currentUser).toBe(null);
    expect(userProfile).toBe(null);
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('signup functionality', () => {
    it('should handle successful signup', async () => {
      const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
      const { setDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      updateProfile.mockResolvedValue();
      setDoc.mockResolvedValue();
      
      const { signup } = useAuthStore.getState();
      await signup('test@example.com', 'password123', 'Test User');
      
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
    });

    it('should handle signup errors', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already exists'));
      
      const { signup } = useAuthStore.getState();
      
      await expect(signup('existing@example.com', 'password123', 'Test User'))
        .rejects.toThrow('Email already exists');
      
      const { error } = useAuthStore.getState();
      expect(error).toBe('Email already exists');
    });
  });

  describe('login functionality', () => {
    it('should handle successful login', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { getDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      const mockUserProfile = { role: 'customer', displayName: 'Test User' };
      
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile
      });
      
      const { login } = useAuthStore.getState();
      await login('test@example.com', 'password123');
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      
      const { currentUser, userProfile } = useAuthStore.getState();
      expect(currentUser).toEqual(mockUser);
      expect(userProfile).toEqual(mockUserProfile);
    });

    it('should handle login errors', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));
      
      const { login } = useAuthStore.getState();
      
      await expect(login('wrong@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
      
      const { error } = useAuthStore.getState();
      expect(error).toBe('Invalid credentials');
    });
  });

  describe('logout functionality', () => {
    it('should handle successful logout', async () => {
      const { signOut } = require('firebase/auth');
      signOut.mockResolvedValue();
      
      // Set initial logged-in state
      useAuthStore.setState({
        currentUser: { uid: 'test-uid' },
        userProfile: { role: 'customer' }
      });
      
      const { logout } = useAuthStore.getState();
      await logout();
      
      expect(signOut).toHaveBeenCalled();
      
      const { currentUser, userProfile } = useAuthStore.getState();
      expect(currentUser).toBe(null);
      expect(userProfile).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should clear errors', () => {
      useAuthStore.setState({ error: 'Some error' });
      
      const { clearError } = useAuthStore.getState();
      clearError();
      
      const { error } = useAuthStore.getState();
      expect(error).toBe(null);
    });
  });

  describe('user profile updates', () => {
    it('should update user profile', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValue();
      
      // Set initial state
      useAuthStore.setState({
        currentUser: { uid: 'test-uid' },
        userProfile: { role: 'customer', displayName: 'Old Name' }
      });
      
      const { updateProfile } = useAuthStore.getState();
      await updateProfile({ displayName: 'New Name' });
      
      expect(setDoc).toHaveBeenCalled();
      
      const { userProfile } = useAuthStore.getState();
      expect(userProfile.displayName).toBe('New Name');
    });
  });
});