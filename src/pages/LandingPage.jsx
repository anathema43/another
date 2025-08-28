import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-himalaya-light to-himalaya">
      <div className="w-full max-w-4xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
        {/* Hero Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://res.cloudinary.com/dj4kdlwzo/image/upload/v1752940186/darjeeling_qicpwi.avif"
            alt="Himalayas"
            className="rounded-lg shadow-2xl w-80 md:w-96"
            style={{ objectFit: "cover", borderRadius: "1rem" }}
          />
        </div>
        {/* Hero Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-himalaya-dark mb-4">
            Discover Authentic Himalayan Goodness
          </h1>
          <p className="text-lg md:text-xl text-himalaya-dark mb-8">
            <span className="text-himalaya">Ramro</span> brings you a curated selection of organic, locally made products from the heart of the Himalayas — fresh pickles, pure honey, bamboo shoot achar, and more. <br />
            Shop directly from mountain farmers and support sustainable communities.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Link to="/products">
              <button className="bg-himalaya text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-himalaya-dark transition text-lg">
                Shop Now
              </button>
            </Link>
            <Link to="/about">
              <button className="bg-white text-himalaya font-bold px-6 py-3 rounded-lg shadow border border-himalaya hover:bg-himalaya-light transition text-lg">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <span role="img" aria-label="Organic" className="text-3xl">🌱</span>
            <h2 className="font-bold text-xl mt-2 mb-1 text-himalaya-dark">100% Natural</h2>
            <p>Every product is grown and crafted in the Himalayas — with no additives or chemicals.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <span role="img" aria-label="Direct" className="text-3xl">🤝</span>
            <h2 className="font-bold text-xl mt-2 mb-1 text-himalaya-dark">Local & Fair</h2>
            <p>We buy direct from small farmers and women’s collectives. Your purchase empowers them!</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <span role="img" aria-label="Shipping" className="text-3xl">🚚</span>
            <h2 className="font-bold text-xl mt-2 mb-1 text-himalaya-dark">Pan-India Shipping</h2>
            <p>Delivered fresh, fast and safe to your doorstep anywhere in India.</p>
          </div>
        </div>
      </div>
      <footer className="mt-20 mb-4 text-center text-himalaya-dark opacity-80">
        © {new Date().getFullYear()} Ramro · Made with ❤️ in the Himalayas
      </footer>
    </div>
  );
}
