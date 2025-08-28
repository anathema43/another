import React from "react";

export default function ReviewStars({ rating = 0 }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  
  for (let i = 0; i < 5; ++i) {
    if (i < full) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    } else if (i === full && half) {
      stars.push(<span key={i} className="text-yellow-400">☆</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
  }
  
  return (
    <div className="flex items-center" data-testid="review-stars">
      <span className="text-sm flex">{stars}</span>
      <span className="sr-only">{rating} out of 5 stars</span>
    </div>
  );
}
