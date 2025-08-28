import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import formatCurrency from "../utils/formatCurrency";
import AddToCartButton from "../components/AddToCartButton";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function Cart() {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6">
          <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Your Cart is Empty</h1>
          <p className="text-gray-600">Looks like you haven't added any items to your cart yet.</p>
        </div>
        <Link 
          to="/shop" 
          className="inline-block px-8 py-3 bg-himalaya text-white rounded-lg hover:bg-himalaya-dark transition-colors font-semibold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-organic-text">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear All Items
        </button>
      </div>

      <div className="bg-organic-white rounded-lg shadow-lg overflow-hidden">
        {/* Cart Items */}
        <div className="divide-y divide-gray-200">
          {cart.map((item) => (
            <div key={item.id} className="p-6 flex items-center gap-6">
              {/* Product Image */}
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-organic-text mb-1">
                  <Link 
                    to={`/products/${item.id}`}
                    className="hover:text-organic-primary transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="text-lg font-semibold text-green-700">{formatCurrency(item.price)}</p>
                {item.quantityAvailable <= 5 && item.quantityAvailable > 0 && (
                  <p className="text-orange-600 text-xs mt-1">
                    Only {item.quantityAvailable} left in stock
                  </p>
                )}
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <AddToCartButton product={item} />
                <div className="text-right">
                  <p className="text-sm text-organic-text opacity-75">Subtotal</p>
                  <p className="text-lg font-semibold text-organic-text">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-organic-background p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-organic-text opacity-75">
                Total Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
              <p className="text-2xl font-bold text-organic-text">
                Total: {formatCurrency(getTotalPrice())}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/shop"
                className="btn-secondary px-6 py-3 rounded-lg font-semibold"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary px-8 py-3 rounded-lg font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="text-sm text-organic-text opacity-75 space-y-1">
            <p>• Free shipping on orders over ₹500</p>
            <p>• Secure checkout with multiple payment options</p>
            <p>• 7-day return policy on all items</p>
          </div>
        </div>
      </div>
    </div>
  );
}