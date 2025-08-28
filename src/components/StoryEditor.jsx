import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { PlusIcon, PhotoIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageUpload from './ImageUpload';
import LoadingButton from './LoadingButton';

export default function StoryEditor({ story, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: story?.title || '',
    excerpt: story?.excerpt || '',
    content: story?.content || '',
    author: story?.author || '',
    authorImage: story?.authorImage || '',
    authorBio: story?.authorBio || '',
    category: story?.category || 'artisan-story',
    featuredImage: story?.featuredImage || '',
    tags: story?.tags?.join(', ') || '',
    featured: story?.featured || false,
    readTime: story?.readTime || '5 min read'
  });

  const categories = [
    { value: 'events', label: 'Events & Festivals' },
    { value: 'people', label: 'People & Profiles' },
    { value: 'places', label: 'Places & Destinations' },
    { value: 'traditions', label: 'Traditions & Culture' },
    { value: 'artisan-story', label: 'Artisan Stories' },
    { value: 'food-culture', label: 'Food & Recipes' },
    { value: 'community', label: 'Community Impact' },
    { value: 'sustainability', label: 'Environment & Nature' },
    { value: 'news', label: 'News & Updates' },
    { value: 'business', label: 'Business & Economy' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (field, imageData) => {
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        [field]: imageData.optimizedUrl || imageData.secureUrl
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.author) {
      setMessage('Please fill in title, content, and author');
      return;
    }

    if (!db) {
      setMessage('✅ Demo mode - story would be saved in production');
      setTimeout(() => {
        if (onSave) onSave();
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publishedAt: story?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (story) {
        await updateDoc(doc(db, 'stories', story.id), storyData);
      } else {
        await addDoc(collection(db, 'stories'), storyData);
      }

      setMessage('Story saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      setMessage('Error saving story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-organic-text">
            {story ? 'Edit Story' : 'Create New Story'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                placeholder="The Ancient Art of Darjeeling Pickle Making"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Name *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                placeholder="Deepak Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                placeholder="5 min read"
              />
            </div>
          </div>

          {/* Story Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Excerpt *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
              placeholder="A brief, compelling summary of the story that will appear on the stories page..."
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <ImageUpload
              currentImage={formData.featuredImage}
              onImageUploaded={(imageData) => handleImageUpload('featuredImage', imageData)}
              folder="darjeeling/stories"
            />
          </div>

          {/* Author Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Image
              </label>
              <ImageUpload
                currentImage={formData.authorImage}
                onImageUploaded={(imageData) => handleImageUpload('authorImage', imageData)}
                folder="darjeeling/authors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Bio
              </label>
              <textarea
                value={formData.authorBio}
                onChange={(e) => handleInputChange('authorBio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                placeholder="Brief bio about the author..."
              />
            </div>
          </div>

          {/* Story Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent font-mono text-sm"
              placeholder="Write your story here...

Example:
In the early morning mist of Darjeeling, when the hills are shrouded in clouds...

## The Traditional Method

Deepak begins each day by selecting the finest vegetables...

## Community Impact

Every jar sold supports 8 local families..."
            />
            <div className="text-xs text-gray-500 mt-2">
              <p><strong>Formatting tips:</strong></p>
              <p>• Use "## Heading" for section headings</p>
              <p>• Use double line breaks for new paragraphs</p>
              <p>• Write naturally - like telling a friend about the artisan</p>
              <p>• Include personal details, traditional methods, and community impact</p>
            </div>
          </div>

          {/* Tags and Settings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary"
                placeholder="traditional-recipes, family-heritage, pickle-making"
              />
            </div>
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
              />
              <label className="text-sm font-medium text-gray-700">
                Featured Story (appears at top of stories page)
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <LoadingButton
              onClick={handleSave}
              loading={loading}
              className="flex items-center gap-2 bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              loadingText="Saving..."
            >
              <CheckIcon className="w-4 h-4" />
              {story ? 'Update Story' : 'Create Story'}
            </LoadingButton>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}