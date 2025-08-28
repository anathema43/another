import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReviewStore } from '../reviewStore'

// Mock Firebase
vi.mock('../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn()
}))

vi.mock('../authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' }
    }))
  }
}))

describe('ReviewStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useReviewStore.setState({ 
      reviews: [], 
      productReviews: {}, 
      loading: false, 
      error: null 
    });
  });

  it('should initialize with empty state', () => {
    const { reviews, productReviews, loading, error } = useReviewStore.getState();
    
    expect(reviews).toEqual([]);
    expect(productReviews).toEqual({});
    expect(loading).toBe(false);
    expect(error).toBe(null);
  });

  describe('addReview functionality', () => {
    it('should add a new review', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'review-123' });
      
      const reviewData = {
        productId: 'product-1',
        rating: 5,
        comment: 'Excellent product!'
      };
      
      const { addReview } = useReviewStore.getState();
      const result = await addReview(reviewData);
      
      expect(addDoc).toHaveBeenCalled();
      expect(result.id).toBe('review-123');
      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Excellent product!');
      expect(result.userId).toBe('test-user-123');
    });

    it('should require authentication to add review', async () => {
      // Mock no current user
      const { useAuthStore } = require('../authStore');
      useAuthStore.getState.mockReturnValue({ currentUser: null });
      
      const { addReview } = useReviewStore.getState();
      
      await expect(addReview({ productId: 'product-1', rating: 5, comment: 'Test' }))
        .rejects.toThrow('User not authenticated');
    });
  });

  describe('fetchProductReviews functionality', () => {
    it('should fetch reviews for a specific product', async () => {
      const { getDocs } = require('firebase/firestore');
      const mockReviews = [
        { id: 'review-1', rating: 5, comment: 'Great!', userId: 'user-1' },
        { id: 'review-2', rating: 4, comment: 'Good', userId: 'user-2' }
      ];
      
      getDocs.mockResolvedValue({
        docs: mockReviews.map(review => ({
          id: review.id,
          data: () => review
        }))
      });
      
      const { fetchProductReviews } = useReviewStore.getState();
      const result = await fetchProductReviews('product-1');
      
      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(5);
      expect(result[1].rating).toBe(4);
      
      const { productReviews } = useReviewStore.getState();
      expect(productReviews['product-1']).toHaveLength(2);
    });
  });

  describe('getReviewStats functionality', () => {
    it('should calculate review statistics correctly', () => {
      // Set up mock reviews
      useReviewStore.setState({
        productReviews: {
          'product-1': [
            { rating: 5, comment: 'Excellent' },
            { rating: 4, comment: 'Good' },
            { rating: 5, comment: 'Amazing' },
            { rating: 3, comment: 'Okay' }
          ]
        }
      });
      
      const { getReviewStats } = useReviewStore.getState();
      const stats = getReviewStats('product-1');
      
      expect(stats.totalReviews).toBe(4);
      expect(stats.averageRating).toBe(4.3); // (5+4+5+3)/4 = 4.25, rounded to 4.3
      expect(stats.ratingDistribution[5]).toBe(2);
      expect(stats.ratingDistribution[4]).toBe(1);
      expect(stats.ratingDistribution[3]).toBe(1);
    });

    it('should handle products with no reviews', () => {
      const { getReviewStats } = useReviewStore.getState();
      const stats = getReviewStats('product-with-no-reviews');
      
      expect(stats.totalReviews).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.ratingDistribution).toEqual({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    });
  });

  describe('hasUserReviewed functionality', () => {
    it('should check if user has reviewed a product', () => {
      useReviewStore.setState({
        productReviews: {
          'product-1': [
            { userId: 'test-user-123', rating: 5, comment: 'Great!' },
            { userId: 'other-user', rating: 4, comment: 'Good' }
          ]
        }
      });
      
      const { hasUserReviewed } = useReviewStore.getState();
      
      expect(hasUserReviewed('product-1')).toBe(true);
      expect(hasUserReviewed('product-2')).toBe(false);
    });
  });
});