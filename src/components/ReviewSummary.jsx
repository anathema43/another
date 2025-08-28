import React from 'react';
import { useReviewStore } from '../store/reviewStore';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ReviewSummary({ productId }) {
  const { getReviewStats } = useReviewStore();
  const stats = getReviewStats(productId);

  if (stats.totalReviews === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg" data-cy="rating-summary">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400 mb-2">No Reviews Yet</div>
          <p className="text-gray-600">Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg" data-cy="rating-summary">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-organic-text" data-cy="average-rating">
            {stats.averageRating}
          </div>
          <div className="flex items-center justify-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600" data-cy="review-count">
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
}