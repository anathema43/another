import React from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "./ResponsiveImage";
import ReviewStars from "./ReviewStars";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
import formatCurrency from "../utils/formatCurrency";
import ArtisanCard from "./ArtisanCard";

export default function ProductCard({ product }) {
  return (
    <article className="bg-white rounded-lg shadow-lg p-4 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-organic-primary focus-within:ring-offset-2" data-cy="product-card" role="article" aria-labelledby={`product-title-${product.id}`}>
      <div className="relative">
        <ResponsiveImage
          src={product.image}
          alt={`${product.name} - Authentic Himalayan product`}
          className="w-full h-44 rounded-md mb-2"
          sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
          data-cy="product-image"
        />
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
        {product.quantityAvailable === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md" data-cy="out-of-stock-badge" role="status" aria-label="Product is out of stock">
            <span className="text-white font-bold text-lg" aria-hidden="true">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <h2 id={`product-title-${product.id}`} className="text-lg font-bold text-organic-text mb-1" data-cy="product-name">{product.name}</h2>
        <div data-cy="product-rating">
          <ReviewStars rating={product.rating} />
          <span className="sr-only">{product.rating} out of 5 stars</span>
        </div>
        <p className="text-organic-text opacity-75 mb-2 text-sm flex-1 line-clamp-3" aria-describedby={`product-title-${product.id}`}>{product.description}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-organic-text" data-cy="product-price" aria-label={`Price: ${formatCurrency(product.price)}`}>{formatCurrency(product.price)}</span>
            <Link 
              to={`/products/${product.id}`} 
              className="text-organic-primary hover:text-organic-text text-sm font-medium underline hover:no-underline transition-all focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2 rounded"
              data-cy="view-details-link"
              aria-label={`View details for ${product.name}`}
            >
              View Details
            </Link>
          </div>
          
          <AddToCartButton product={product} className="w-full" />
          
          {/* Artisan Link */}
          {product.artisanId && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-organic-text opacity-75 mb-2" id={`artisan-label-${product.id}`}>Crafted by:</p>
              <Link 
                to={`/artisans/${product.artisanId}`}
                className="text-organic-primary hover:text-organic-text text-sm font-medium underline hover:no-underline transition-all focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2 rounded"
                aria-labelledby={`artisan-label-${product.id}`}
                aria-label={`View profile of artisan ${product.artisan || 'who crafted this product'}`}
              >
                {product.artisan || 'View Artisan Profile'} →
              </Link>
            </div>
          )}
          
          {product.quantityAvailable > 0 && product.quantityAvailable <= 5 && (
            <p className="text-orange-600 text-xs mt-1 text-center" data-cy="stock-warning" role="status" aria-live="polite">
              Only {product.quantityAvailable} left in stock!
            </p>
          )}
        </div>
      </div>
    </article>
  );
}