import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ContentEditor from "../components/ContentEditor";

export default function TermsOfUse() {
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
              pageId="terms-of-use" 
              title="Terms of Use"
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Terms of Use
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Clear guidelines for using our platform
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
              Terms of Use
            </h2>
            
            <div className="prose prose-lg max-w-none text-organic-text">
              <p className="text-lg leading-relaxed">
                The legal content for this page is currently being drafted by our legal team and will be published here shortly. Thank you for your patience.
              </p>
              
              <div className="mt-8 p-6 bg-organic-background rounded-lg">
                <h3 className="font-semibold text-organic-text mb-3">In the meantime</h3>
                <p className="text-organic-text opacity-75">
                  If you have any questions about our terms and conditions, 
                  please feel free to reach out to our support team.
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                to="/contact" 
                className="inline-block bg-organic-primary text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}