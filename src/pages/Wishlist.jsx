import React, { useEffect, useState } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Wishlist() {
  const { wishlist, loading, loadWishlist } = useWishlistStore();
  const { products, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { currentUser } = useAuthStore();
  const [wishlistProducts, setWishlistProducts] = useState([]);

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-organic-text mb-4">Please login to view your wishlist</h2>
          <a 
            href="/#/login" 
            className="bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadWishlist();
    if (products.length === 0) {
      fetchProducts();
    }
  }, [loadWishlist, fetchProducts, products.length]);

  useEffect(() => {
    if (wishlist.length > 0 && products.length > 0) {
      // More efficient: only fetch products that are in wishlist
      const wishlistProductPromises = wishlist.map(productId => 
        fetchProducts().then(allProducts => 
          allProducts.find(p => p.id === productId)
        ).filter(Boolean)
      );
      
      Promise.all(wishlistProductPromises).then(products => {
        setWishlistProducts(products.filter(Boolean));
      });
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist, products]);

  const moveAllToCart = () => {
    wishlistProducts.forEach(product => {
      addToCart(product, 1);
    });
    // Optionally clear wishlist after moving to cart
    // clearWishlist();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-organic-background py-8" data-cy="wishlist-page">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-organic-text" data-cy="wishlist-title">My Wishlist</h1>
          {wishlistProducts.length > 0 && (
            <button
              onClick={moveAllToCart}
              className="bg-organic-primary text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              Move All to Cart
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12" data-cy="empty-wishlist">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-organic-text mb-2">Your Wishlist is Empty</h2>
            <p className="text-organic-text opacity-75 mb-6">
              Save items you love to your wishlist and shop them later.
            </p>
            <a 
              href="/#/shop"
              data-cy="continue-shopping"
              className="inline-block bg-organic-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-organic-text opacity-75">
                {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative" data-cy="wishlist-item">
                  <ProductCard product={product} />
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="bg-organic-primary text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-all"
                      title="Add to Cart"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-all"
                      title="Remove from Wishlist"
                      data-cy="remove-from-wishlist"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}