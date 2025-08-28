import React, { useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ReviewList({ productId }) {
  const { productReviews, fetchProductReviews, loading } = useReviewStore();
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
    <div className="space-y-6" data-cy="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-organic-text">
                  {review.userName || 'Anonymous'}
                </span>
                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-organic-text leading-relaxed">{review.comment}</p>
          
          <div className="flex items-center gap-4 text-sm mt-4">
            <button
              className="text-gray-600 hover:text-organic-primary transition-colors"
            >
              👍 Helpful ({review.helpful || 0})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}