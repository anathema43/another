import React, { useState } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { addReview } = useReviewStore();
  const { currentUser } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please write a review';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        rating,
        comment: comment.trim()
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setErrors({});
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center" data-cy="login-to-review">
        <p className="text-gray-600 mb-4">Please log in to write a review</p>
        <a 
          href="/#/login" 
          className="inline-block bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4" data-cy="review-form">
      <h3 className="text-lg font-semibold text-organic-text">Write a Review</h3>
      
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-organic-text mb-2">
          Your Rating *
        </label>
        <div className="flex items-center space-x-1" data-cy="review-rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= rating;
            const StarComponent = isFilled ? StarIcon : StarOutlineIcon;
            
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                <StarComponent 
                  className={`w-8 h-8 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              </button>
            );
          })}
        </div>
        {errors.rating && (
          <p className="text-red-600 text-sm mt-1" data-cy="rating-error">{errors.rating}</p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-organic-text mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
          data-cy="review-text"
        />
        <div className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters
        </div>
        {errors.comment && (
          <p className="text-red-600 text-sm mt-1" data-cy="review-text-error">{errors.comment}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-organic-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        data-cy="submit-review"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>

      {errors.submit && (
        <p className="text-red-600 text-sm" data-cy="submit-error">{errors.submit}</p>
      )}
      
      {/* Success message will be handled by parent component */}
    </form>
  );
}