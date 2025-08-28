import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useArtisanStore } from '../store/artisanStore';
import ImageUpload from './ImageUpload';
import LoadingButton from './LoadingButton';

export default function ArtisanFormModal({ artisan, onClose, onSave }) {
  const { addArtisan, updateArtisan } = useArtisanStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    region: '',
    experience: '',
    profileImage: '',
    shortBio: '',
    story: '',
    specialties: '',
    techniques: '',
    values: '',
    culturalHeritage: '',
    familyMembers: '',
    featured: false
  });

  useEffect(() => {
    if (artisan) {
      setFormData({
        name: artisan.name || '',
        title: artisan.title || '',
        location: artisan.location || '',
        region: artisan.region || '',
        experience: artisan.experience?.toString() || '',
        profileImage: artisan.profileImage || '',
        shortBio: artisan.shortBio || '',
        story: artisan.story || '',
        specialties: Array.isArray(artisan.specialties) ? artisan.specialties.join(', ') : '',
        techniques: Array.isArray(artisan.techniques) ? artisan.techniques.join(', ') : '',
        values: Array.isArray(artisan.values) ? artisan.values.join(', ') : '',
        culturalHeritage: artisan.culturalHeritage || '',
        familyMembers: artisan.familyMembers?.toString() || '',
        featured: artisan.featured || false
      });
    }
  }, [artisan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (imageData) => {
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        profileImage: imageData.optimizedUrl || imageData.secureUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const artisanData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        familyMembers: parseInt(formData.familyMembers) || 0,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        techniques: formData.techniques.split(',').map(s => s.trim()).filter(s => s),
        values: formData.values.split(',').map(s => s.trim()).filter(s => s),
        updatedAt: new Date().toISOString()
      };

      if (artisan) {
        await updateArtisan(artisan.id, artisanData);
      } else {
        artisanData.createdAt = new Date().toISOString();
        artisanData.rating = 0;
        artisanData.reviewCount = 0;
        artisanData.productCount = 0;
        await addArtisan(artisanData);
      }

      onSave();
    } catch (err) {
      setError(err.message || 'Failed to save artisan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-organic-text">
            {artisan ? 'Edit Artisan' : 'Add New Artisan'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Master Pickle Maker"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Darjeeling, West Bengal"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., West Bengal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Members Supported
              </label>
              <input
                type="number"
                name="familyMembers"
                value={formData.familyMembers}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <ImageUpload
              onImageUploaded={handleImageUpload}
              currentImage={formData.profileImage}
              folder="ramro/artisans"
            />
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Bio *
            </label>
            <textarea
              name="shortBio"
              value={formData.shortBio}
              onChange={handleChange}
              rows={2}
              required
              placeholder="Brief description for artisan cards"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
            />
          </div>

          {/* Full Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Story
            </label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed personal narrative and background"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
            />
          </div>

          {/* Skills and Techniques */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <input
                type="text"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                placeholder="Comma-separated: Traditional Pickles, Fermentation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Techniques
              </label>
              <input
                type="text"
                name="techniques"
                value={formData.techniques}
                onChange={handleChange}
                placeholder="Comma-separated: Hand-grinding, Solar drying"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cultural Values
            </label>
            <input
              type="text"
              name="values"
              value={formData.values}
              onChange={handleChange}
              placeholder="Comma-separated: Preserving family recipes, Supporting local farmers"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cultural Heritage
            </label>
            <textarea
              name="culturalHeritage"
              value={formData.culturalHeritage}
              onChange={handleChange}
              rows={3}
              placeholder="Description of traditional techniques and cultural practices"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
            />
            <label className="text-sm font-medium text-gray-700">
              Featured Artisan (appears on homepage)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <LoadingButton
              type="submit"
              loading={loading}
              className="flex-1 bg-organic-primary text-white py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              loadingText="Saving..."
            >
              {artisan ? 'Update Artisan' : 'Create Artisan'}
            </LoadingButton>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}