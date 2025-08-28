import React, { useState, useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'w-5 h-5' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        const StarComponent = isFilled ? StarIcon : StarOutlineIcon;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          >
            <StarComponent 
              className={`${size} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`} 
            />
          </button>
        );
      })}
    </div>
  );
};

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview } = useReviewStore();
  const { currentUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        rating,
        comment: comment.trim(),
        title: title.trim() || undefined
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setTitle('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold text-organic-text">Write a Review</h3>
      
      <div>
        <label className="block text-sm font-medium text-organic-text mb-2">
          Your Rating *
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="w-8 h-8" />
      </div>

      <div>
        <label className="block text-sm font-medium text-organic-text mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
          maxLength={100}
        />
      </div>

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
          maxLength={1000}
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 characters
        </div>
      </div>

      <button
        type="submit"
        disabled={!rating || !comment.trim() || isSubmitting}
        className="w-full bg-organic-primary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const ReviewList = ({ productId }) => {
  const { productReviews, fetchProductReviews, markHelpful, loading } = useReviewStore();
  const reviews = productReviews[productId] || [];

  useEffect(() => {
    fetchProductReviews(productId);
  }, [productId, fetchProductReviews]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} readonly size="w-4 h-4" />
                <span className="font-semibold text-organic-text">
                  {review.userName}
                </span>
                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              {review.title && (
                <h4 className="font-medium text-organic-text">{review.title}</h4>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-organic-text mb-4 leading-relaxed">{review.comment}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => markHelpful(review.id)}
              className="text-gray-600 hover:text-organic-primary transition-colors"
            >
              👍 Helpful ({review.helpful || 0})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReviewStats = ({ productId }) => {
  const { getReviewStats } = useReviewStore();
  const stats = getReviewStats(productId);

  if (stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-organic-text">
            {stats.averageRating}
          </div>
          <StarRating rating={stats.averageRating} readonly size="w-5 h-5" />
          <div className="text-sm text-gray-600 mt-1">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating];
            const percentage = stats.totalReviews > 0 
              ? (count / stats.totalReviews) * 100 
              : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ReviewSystem({ productId }) {
  const { hasUserReviewed } = useReviewStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const userHasReviewed = hasUserReviewed(productId);

  return (
    <div className="space-y-8">
      <ReviewStats productId={productId} />
      
      {!userHasReviewed && (
        <div>
          {showReviewForm ? (
            <ReviewForm 
              productId={productId} 
              onReviewSubmitted={() => setShowReviewForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
            >
              Write a Review
            </button>
          )}
        </div>
      )}
      
      <div>
        <h3 className="text-xl font-semibold text-organic-text mb-4">Customer Reviews</h3>
        <ReviewList productId={productId} />
      </div>
    </div>
  );
}