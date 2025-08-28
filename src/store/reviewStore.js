import { create } from "zustand";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";

export const useReviewStore = create((set, get) => ({
  reviews: [],
  productReviews: {},
  loading: false,
  error: null,

  // Fetch reviews for a specific product
  fetchProductReviews: async (productId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      set(state => ({
        productReviews: {
          ...state.productReviews,
          [productId]: reviews
        },
        loading: false
      }));
      
      return reviews;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Add a new review
  addReview: async (reviewData) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error("User not authenticated");
    
    set({ error: null });
    try {
      const review = {
        ...reviewData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpful: 0,
        verified: false // Can be set to true if user purchased the product
      };
      
      const docRef = await addDoc(collection(db, "reviews"), review);
      const newReview = { ...review, id: docRef.id };
      
      // Update product reviews in state
      set(state => ({
        productReviews: {
          ...state.productReviews,
          [reviewData.productId]: [
            newReview,
            ...(state.productReviews[reviewData.productId] || [])
          ]
        }
      }));
      
      // Update product rating
      await get().updateProductRating(reviewData.productId);
      
      return newReview;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Update product's average rating and review count
  updateProductRating: async (productId) => {
    try {
      const reviews = get().productReviews[productId] || [];
      if (reviews.length === 0) return;
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: reviews.length,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating product rating:", error);
    }
  },

  // Update a review
  updateReview: async (reviewId, updates) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error("User not authenticated");
    
    set({ error: null });
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(reviewRef, updateData);
      
      // Update in state
      set(state => {
        const updatedProductReviews = { ...state.productReviews };
        Object.keys(updatedProductReviews).forEach(productId => {
          updatedProductReviews[productId] = updatedProductReviews[productId].map(review =>
            review.id === reviewId ? { ...review, ...updateData } : review
          );
        });
        return { productReviews: updatedProductReviews };
      });
      
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId, productId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) throw new Error("User not authenticated");
    
    set({ error: null });
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Remove from state
      set(state => ({
        productReviews: {
          ...state.productReviews,
          [productId]: (state.productReviews[productId] || []).filter(
            review => review.id !== reviewId
          )
        }
      }));
      
      // Update product rating
      await get().updateProductRating(productId);
      
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (reviewDoc.exists()) {
        const currentHelpful = reviewDoc.data().helpful || 0;
        await updateDoc(reviewRef, {
          helpful: currentHelpful + 1,
          updatedAt: new Date().toISOString()
        });
        
        // Update in state
        set(state => {
          const updatedProductReviews = { ...state.productReviews };
          Object.keys(updatedProductReviews).forEach(productId => {
            updatedProductReviews[productId] = updatedProductReviews[productId].map(review =>
              review.id === reviewId 
                ? { ...review, helpful: currentHelpful + 1 }
                : review
            );
          });
          return { productReviews: updatedProductReviews };
        });
      }
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Get user's reviews
  fetchUserReviews: async () => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) return [];
    
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      set({ reviews, loading: false });
      return reviews;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Check if user has reviewed a product
  hasUserReviewed: (productId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser) return false;
    
    const reviews = get().productReviews[productId] || [];
    return reviews.some(review => review.userId === currentUser.uid);
  },

  // Get review statistics for a product
  getReviewStats: (productId) => {
    const reviews = get().productReviews[productId] || [];
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    
    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution
    };
  },

  clearError: () => set({ error: null }),
}));