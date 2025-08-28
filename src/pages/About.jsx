import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ContentEditor from "../components/ContentEditor";
import Logo from "../components/Logo";

export default function About() {
  const { userProfile } = useAuthStore();
  const [showEditor, setShowEditor] = React.useState(false);
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-organic-background" data-cy="about-page">
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="fixed top-20 right-4 z-40">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="bg-organic-primary text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            title="Edit page content"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Content Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <ContentEditor 
              pageId="about" 
              title="About Us"
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white" data-cy="about-hero">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <Logo className="text-white justify-center" size="large" linkTo={null} />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Connecting the world with authentic Darjeeling hill craftsmanship and organic goodness
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
              Born in the Mountains
            </h2>
            <p className="text-organic-text mb-6 leading-relaxed">
              Darjeeling Soul began as a dream to bridge the gap between the pristine Darjeeling hills and the global community. 
              Founded by hill enthusiasts who witnessed firsthand the incredible craftsmanship and organic farming 
              practices of local communities, we set out to create a platform that honors tradition while embracing modernity.
            </p>

            <h2 className="font-display text-3xl font-bold text-organic-text mb-6 mt-12">
              Our Mission
            </h2>
            <p className="text-organic-text mb-6 leading-relaxed">
              We believe in the power of authentic, handcrafted products to tell stories, preserve traditions, and 
              support sustainable livelihoods. Every item in our collection is carefully selected for its quality, 
              authenticity, and the positive impact it creates for local artisans and farmers.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-xl text-organic-text mb-3">🌱 Sustainability First</h3>
                <p className="text-organic-text">
                  We prioritize eco-friendly practices, from sourcing to packaging, ensuring our impact on the 
                  environment is positive and regenerative.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-xl text-organic-text mb-3">🤝 Fair Trade</h3>
                <p className="text-organic-text">
                  Our partnerships with local artisans ensure fair compensation and long-term relationships 
                  that benefit entire communities.
                </p>
              </div>
            </div>

            <h2 className="font-display text-3xl font-bold text-organic-text mb-6 mt-12">
              The Darjeeling Soul Promise
            </h2>
            <ul className="list-disc list-inside text-organic-text space-y-3 mb-8">
              <li>100% authentic products sourced directly from artisans</li>
              <li>Organic certification for all food products</li>
              <li>Fair trade practices ensuring artisan welfare</li>
              <li>Sustainable packaging and carbon-neutral shipping</li>
              <li>Cultural preservation through traditional crafts</li>
            </ul>

            <div className="text-center mt-12">
              <Link 
                to="/shop" 
                className="inline-block bg-organic-primary text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              >
                Explore Our Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}