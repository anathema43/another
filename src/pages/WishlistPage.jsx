import React from "react";
import { useUserStore } from "../store/userStore"; // adjust path

const WishlistButton = ({ product }) => {
  // get wishlist from store, fallback to []
  const wishlist = useUserStore((s) => s.wishlist) || [];
  const toggleWishlist = useUserStore((s) => s.toggleWishlist);

  const isWishlisted = wishlist.includes(product.id);

  return (
    <button
      className={`px-2 py-1 rounded ${isWishlisted ? "bg-pink-400 text-white" : "bg-gray-100"}`}
      onClick={() => toggleWishlist(product.id)}
    >
      {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
    </button>
  );
};

export default WishlistButton;
