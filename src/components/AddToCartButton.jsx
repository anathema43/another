import React from "react";
import { useCartStore } from "../store/cartStore";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id);

  if (quantity === 0) {
    return (
      <button
        onClick={() => addToCart(product, 1)}
        disabled={product.quantityAvailable === 0}
        className={`px-4 py-2 bg-organic-primary text-organic-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2 ${className}`}
        aria-label={product.quantityAvailable === 0 ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        data-cy="add-to-cart-button"
      >
        {product.quantityAvailable === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label={`Quantity controls for ${product.name}`}>
      <button
        onClick={() => updateQuantity(product.id, quantity - 1)}
        className="w-8 h-8 flex items-center justify-center bg-organic-background hover:bg-organic-primary text-organic-text hover:text-organic-white rounded-full transition-all duration-200 border border-organic-text shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2"
        aria-label={`Decrease quantity of ${product.name}`}
        data-cy="quantity-decrease"
      >
        <MinusIcon className="w-4 h-4" aria-hidden="true" />
      </button>
      <span 
        className="min-w-[2rem] text-center font-semibold text-organic-text bg-organic-white px-2 py-1 rounded border border-organic-text"
        aria-label={`Current quantity: ${quantity}`}
        data-cy="quantity-display"
      >
        {quantity}
      </span>
      <button
        onClick={() => updateQuantity(product.id, quantity + 1)}
        disabled={quantity >= product.quantityAvailable}
        className="w-8 h-8 flex items-center justify-center bg-organic-primary hover:opacity-90 text-organic-white rounded-full transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-organic-primary focus:ring-offset-2"
        aria-label={`Increase quantity of ${product.name}${quantity >= product.quantityAvailable ? ' (maximum reached)' : ''}`}
        data-cy="quantity-increase"
      >
        <PlusIcon className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}