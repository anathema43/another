import React from "react";
import { Link } from "react-router-dom";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Disclaimer
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Important information about our products and services
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
              Disclaimer
            </h2>
            
            <div className="prose prose-lg max-w-none text-organic-text">
              <p className="text-lg leading-relaxed">
                The legal content for this page is currently being drafted by our legal team and will be published here shortly. Thank you for your patience.
              </p>
              
              <div className="mt-8 p-6 bg-organic-background rounded-lg">
                <h3 className="font-semibold text-organic-text mb-3">In the meantime</h3>
                <p className="text-organic-text opacity-75">
                  If you have any questions about our products, services, or policies, 
                  please don't hesitate to contact our team.
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                to="/contact" 
                className="inline-block bg-organic-primary text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}