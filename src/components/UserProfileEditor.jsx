import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export default function UserProfileEditor() {
  const { currentUser, userProfile, updateProfile: updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    dateOfBirth: '',
    addresses: [],
    preferences: {
      currency: 'INR',
      language: 'en',
      notifications: true,
      newsletter: false
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: currentUser?.displayName || '',
        phone: userProfile.phone || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        addresses: userProfile.addresses || [],
        preferences: {
          currency: userProfile.preferences?.currency || 'INR',
          language: userProfile.preferences?.language || 'en',
          notifications: userProfile.preferences?.notifications ?? true,
          newsletter: userProfile.preferences?.newsletter ?? false
        }
      });
    }
  }, [userProfile, currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddressChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          id: Date.now().toString(),
          type: 'home',
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
          isDefault: prev.addresses.length === 0
        }
      ]
    }));
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const setDefaultAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Update Firebase Auth profile
      if (formData.displayName !== currentUser?.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
      }

      // Update Firestore user profile
      await updateUserProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        addresses: formData.addresses,
        preferences: formData.preferences,
        updatedAt: new Date().toISOString()
      });

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-organic-text">My Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-organic-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-organic-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-organic-text mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-organic-text mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-organic-text mb-4">Preferences</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-organic-text mb-2">
                  Currency
                </label>
                <select
                  name="preferences.currency"
                  value={formData.preferences.currency}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-organic-text mb-2">
                  Language
                </label>
                <select
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ne">Nepali</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.notifications"
                  checked={formData.preferences.notifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-organic-text">
                  Receive order and shipping notifications
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.newsletter"
                  checked={formData.preferences.newsletter}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-organic-text">
                  Subscribe to newsletter and promotional emails
                </span>
              </label>
            </div>
          </div>

          {/* Addresses */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-organic-text">Saved Addresses</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={addAddress}
                  className="bg-organic-highlight text-white px-3 py-1 rounded text-sm hover:opacity-90"
                >
                  Add Address
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.addresses.map((address, index) => (
                <div key={address.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={address.type}
                        onChange={(e) => handleAddressChange(index, 'type', e.target.value)}
                        disabled={!isEditing}
                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                      {address.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(index)}
                            className="text-organic-primary text-sm hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={address.name}
                      onChange={(e) => handleAddressChange(index, 'name', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={address.address}
                      onChange={(e) => handleAddressChange(index, 'address', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={address.zipCode}
                      onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={address.country}
                      onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                      disabled={!isEditing}
                      className="px-3 py-2 border rounded focus:ring-2 focus:ring-organic-primary disabled:bg-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}