import React from "react";
import { Link } from "react-router-dom";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Return Policy
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Your satisfaction is our priority - easy returns guaranteed
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
              Easy Returns & Refunds
            </h2>
            
            <div className="space-y-6 text-organic-text">
              <div>
                <h3 className="text-xl font-semibold mb-3">🔄 Return Window</h3>
                <p className="leading-relaxed">
                  We offer <strong>7-day returns</strong> on all products from the date of delivery. 
                  Items must be in original condition with packaging intact.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">✅ Eligible Items</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Unopened food products (pickles, honey, grains)</li>
                  <li>Handicrafts and artisan products</li>
                  <li>Spices and seasonings (if unopened)</li>
                  <li>Items damaged during shipping</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">❌ Non-Returnable Items</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Opened or consumed food products</li>
                  <li>Personalized or custom items</li>
                  <li>Items damaged by misuse</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">📋 Return Process</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact our support team at <a href="mailto:support@ramro.com" className="text-organic-primary underline">support@ramro.com</a></li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive return authorization and shipping label</li>
                  <li>Pack items securely in original packaging</li>
                  <li>Ship using provided return label</li>
                  <li>Receive refund within 5-7 business days</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">💰 Refund Information</h3>
                <p className="leading-relaxed mb-3">
                  Refunds are processed to the original payment method:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Credit/Debit cards: 5-7 business days</li>
                  <li>UPI/Digital wallets: 2-3 business days</li>
                  <li>Cash on Delivery: Bank transfer within 7 days</li>
                </ul>
              </div>
              
              <div className="bg-organic-background p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">📞 Need Help?</h3>
                <p className="leading-relaxed mb-3">
                  Our customer support team is here to help with any return questions:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:support@ramro.com" className="text-organic-primary underline">support@ramro.com</a></p>
                  <p><strong>Phone:</strong> +977 1 234 5678</p>
                  <p><strong>Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM (NPT)</p>
                </div>
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
