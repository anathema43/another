import React from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = React.useState(null);

  const faqs = [
    {
      id: 1,
      question: "How does delivery work?",
      answer: "Your order is shipped from the Himalayas within 2-5 business days. We offer free shipping on orders over ₹500 within India. International shipping is available to selected countries."
    },
    {
      id: 2,
      question: "Can I return items?",
      answer: "Yes! We offer 7-day returns on all products. Items must be in original condition. Contact our support team to initiate a return."
    },
    {
      id: 3,
      question: "How do I contact support?",
      answer: "You can reach us at support@ramro.com or call +977 1 234 5678. Our support hours are Monday-Friday, 9:00 AM - 6:00 PM (NPT)."
    },
    {
      id: 4,
      question: "Are your products really organic?",
      answer: "Yes! All our food products are certified organic and sourced directly from local farmers in the Himalayas. We provide certificates of authenticity with each order."
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI payments, net banking, digital wallets, and cash on delivery for domestic orders."
    },
    {
      id: 6,
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order status in your account dashboard."
    },
    {
      id: 7,
      question: "Do you ship internationally?",
      answer: "Yes, we ship to USA, Canada, UK, Australia, Germany, and France. International shipping takes 7-14 business days."
    },
    {
      id: 8,
      question: "What makes Ramro products special?",
      answer: "Our products are handpicked from local artisans in the Himalayas, ensuring authenticity, quality, and fair trade practices. Each purchase supports mountain communities."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };
  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed">
            Find answers to common questions about our products and services
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-organic-background transition-colors"
                >
                  <h3 className="text-lg font-semibold text-organic-text">
                    {faq.question}
                  </h3>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-organic-primary transition-transform ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-organic-text leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="font-display text-2xl font-bold text-organic-text mb-4">
              Still Have Questions?
            </h2>
            <p className="text-organic-text mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="inline-block bg-organic-primary text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Contact Support
              </Link>
              <a 
                href="mailto:support@ramro.com" 
                className="inline-block border border-organic-primary text-organic-primary font-bold px-6 py-3 rounded-lg hover:bg-organic-primary hover:text-white transition-all"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
