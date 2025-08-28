import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { PencilIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ContentEditor({ pageId, title }) {
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    content: '',
    lastUpdated: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageId]);

  const loadContent = async () => {
    try {
      if (!db) {
        // Default content for demo mode
        setContent(getDefaultContent(pageId));
        return;
      }

      const contentDoc = await getDoc(doc(db, 'page_content', pageId));
      if (contentDoc.exists()) {
        setContent(contentDoc.data());
      } else {
        setContent(getDefaultContent(pageId));
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent(getDefaultContent(pageId));
    }
  };

  const getDefaultContent = (pageId) => {
    const defaults = {
      about: {
        title: 'Our Story',
        subtitle: 'Connecting the world with authentic Darjeeling hill craftsmanship and organic goodness',
        content: `Born in the Mountains

Darjeeling Soul began as a dream to bridge the gap between the pristine Darjeeling hills and the global community. Founded by hill enthusiasts who witnessed firsthand the incredible craftsmanship and organic farming practices of local communities, we set out to create a platform that honors tradition while embracing modernity.

Our Mission

We believe in the power of authentic, handcrafted products to tell stories, preserve traditions, and support sustainable livelihoods. Every item in our collection is carefully selected for its quality, authenticity, and the positive impact it creates for local artisans and farmers.

The Darjeeling Soul Promise

• 100% authentic products sourced directly from artisans
• Organic certification for all food products
• Fair trade practices ensuring artisan welfare
• Sustainable packaging and carbon-neutral shipping
• Cultural preservation through traditional crafts`
      },
      contact: {
        title: 'Get in Touch',
        subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        content: `Contact Information

Email: support@darjeelingsouls.com
Phone: +91 98765 43210
Address: Siliguri, West Bengal, India

Business Hours
Monday - Friday: 9:00 AM - 6:00 PM (IST)
Saturday: 10:00 AM - 4:00 PM (IST)
Sunday: Closed`
      },
      'shipping-policy': {
        title: 'Shipping Policy',
        subtitle: 'Careful packaging and shipping from the Darjeeling hills',
        content: `Order Processing Time

Please allow up to 7 business days for us to process and dispatch your order. As we work with small-batch producers, this ensures we can perform a final quality check and package your items with care.

Shipping Confirmation

Once your order is dispatched, you will receive a shipping confirmation email containing your tracking number and a link to track your package.

Delivery Timelines

Delivery times will vary based on your location. You will receive a more accurate delivery estimate at checkout after entering your pincode.`
      },
      'privacy-policy': {
        title: 'Privacy Policy',
        subtitle: 'Your privacy and trust matter to us',
        content: `Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.

How We Use Your Information

We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.`
      },
      'refund-policy': {
        title: 'Refund & Return Policy',
        subtitle: 'Your trust is the most important thing to us',
        content: `Edible Items

Due to the nature of our products and for hygiene and safety reasons, all sales on edible items (e.g., pickles, teas, spices) are final. We do not offer returns or refunds on these items.

Non-Edible Items (Crafts, Decor, Apparel)

We only offer returns for non-edible items if they arrive in a damaged or defective condition.

To be eligible for a return:

1. You must contact us at support@darjeelingsouls.com within 48 hours of receiving your order.
2. You must provide your order number and clear photographic evidence of the damage or defect.`
      }
    };

    return defaults[pageId] || {
      title: title || 'Page Title',
      subtitle: 'Page subtitle',
      content: 'Page content goes here...'
    };
  };

  const saveContent = async () => {
    if (!db) {
      setMessage('Demo mode - changes not saved');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'page_content', pageId), {
        ...content,
        lastUpdated: new Date().toISOString()
      });
      setMessage('Content updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatContentForDisplay = (text) => {
    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('• ')) {
        const listItems = paragraph.split('\n').filter(item => item.startsWith('• '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6">
            {listItems.map((item, i) => (
              <li key={i}>{item.replace('• ', '')}</li>
            ))}
          </ul>
        );
      }
      
      if (paragraph.trim() && !paragraph.includes('\n')) {
        // Check if it's a heading (no punctuation at end, shorter length)
        if (paragraph.length < 50 && !paragraph.endsWith('.') && !paragraph.endsWith('!')) {
          return (
            <h2 key={index} className="font-display text-2xl font-bold text-organic-text mb-4 mt-8">
              {paragraph}
            </h2>
          );
        }
      }
      
      return (
        <p key={index} className="text-organic-text leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-organic-text">
            📝 Edit {title} Page
          </h3>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <EyeIcon className="w-4 h-4" />
                {preview ? 'Hide Preview' : 'Preview'}
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-organic-primary hover:text-organic-text"
            >
              <PencilIcon className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                placeholder="Enter page title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Subtitle
              </label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                placeholder="Enter page subtitle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Content
              </label>
              <textarea
                value={content.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent font-mono text-sm"
                placeholder="Enter page content..."
              />
              <div className="text-xs text-gray-500 mt-2">
                <p><strong>Formatting tips:</strong></p>
                <p>• Use double line breaks for new paragraphs</p>
                <p>• Start lines with "• " for bullet points</p>
                <p>• Short lines without punctuation become headings</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={saveContent}
                disabled={loading}
                className="flex items-center gap-2 bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadContent(); // Reset changes
                }}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {preview ? (
              <div className="border rounded-lg p-6 bg-gray-50">
                <h1 className="font-display text-4xl font-bold text-organic-text mb-4">
                  {content.title}
                </h1>
                <p className="text-xl text-organic-text opacity-75 mb-8">
                  {content.subtitle}
                </p>
                <div className="prose prose-lg max-w-none">
                  {formatContentForDisplay(content.content)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PencilIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Edit" to modify this page content</p>
                <p className="text-sm">or "Preview" to see how it will look</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}