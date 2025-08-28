import React from "react";

export default function ReviewStars({ rating = 0 }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < 5; ++i) {
    if (i < full) stars.push(<span key={i}>★</span>);
    else if (i === full && half) stars.push(<span key={i}>☆</span>);
    else stars.push(<span key={i}>☆</span>);
  }
  return <span className="text-yellow-400 text-sm">{stars}</span>;
}
