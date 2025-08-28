import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out z-40">
      <div className="p-6">
        <h2 className="text-xl font-bold text-himalaya-dark mb-4">Categories</h2>
        <nav className="space-y-2">
          <Link to="/" className="block py-2 px-3 rounded hover:bg-himalaya-light transition">
            All Products
          </Link>
          <Link to="/category/pickles" className="block py-2 px-3 rounded hover:bg-himalaya-light transition">
            Pickles & Preserves
          </Link>
          <Link to="/category/honey" className="block py-2 px-3 rounded hover:bg-himalaya-light transition">
            Honey & Sweets
          </Link>
          <Link to="/category/spices" className="block py-2 px-3 rounded hover:bg-himalaya-light transition">
            Spices & Herbs
          </Link>
        </nav>
      </div>
    </aside>
  );
}