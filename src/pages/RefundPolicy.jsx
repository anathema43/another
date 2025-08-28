import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ContentEditor from "../components/ContentEditor";

export default function RefundPolicy() {
  const { userProfile } = useAuthStore();
  const [showEditor, setShowEditor] = React.useState(false);
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-organic-background">
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
              pageId="refund-policy" 
              title="Refund Policy"
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Refund & Return Policy
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Your trust is the most important thing to us
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6 text-organic-text">
              <p className="text-lg leading-relaxed">
                Your trust is the most important thing to us. We are committed to delivering authentic, high-quality products. Please read our policy carefully.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-red-600">🍯 Edible Items</h3>
                <p className="leading-relaxed">
                  Due to the nature of our products and for hygiene and safety reasons, <strong>all sales on edible items (e.g., pickles, teas, spices) are final.</strong> We do not offer returns or refunds on these items.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-600">🎨 Non-Edible Items (Crafts, Decor, Apparel)</h3>
                <p className="leading-relaxed">
                  We only offer returns for non-edible items if they arrive in a <strong>damaged or defective condition.</strong>
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">📋 To be eligible for a return:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>You must contact us at <a href="mailto:support@darjeelingsouls.com" className="text-organic-primary underline">support@darjeelingsouls.com</a> within <strong>48 hours</strong> of receiving your order.</li>
                  <li>You must provide your order number and clear photographic evidence of the damage or defect.</li>
                </ol>
              </div>
              
              <div className="bg-organic-background p-6 rounded-lg">
                <p className="leading-relaxed">
                  Our team will review your request. If approved, we will arrange for a reverse pickup and, upon receiving the returned item, we will issue a full refund or send a replacement, based on your preference.
                </p>
                <p className="leading-relaxed mt-3">
                  We do not accept returns for non-edible items for any other reason (e.g., change of mind).
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                to="/contact" 
                className="inline-block bg-organic-primary text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all mr-4"
              >
                Contact Support
              </Link>
              <Link 
                to="/shop" 
                className="inline-block border border-organic-primary text-organic-primary font-bold px-6 py-3 rounded-lg hover:bg-organic-primary hover:text-white transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}