import React from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function CartIcon({ count = 0 }) {
  return (
    <div className="relative">
      <ShoppingCartIcon className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
          {count}
        </span>
      )}
    </div>
  );
}
