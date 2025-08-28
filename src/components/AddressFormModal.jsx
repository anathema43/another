import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../store/userStore';
import LoadingButton from './LoadingButton';

export default function AddressFormModal({ address, onClose, onSave }) {
  const { addAddress, updateAddress } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    label: 'Home',
    customLabel: '',
    recipientName: '',
    recipientPhone: '',
    fullAddress: '',
    isDefault: false
  });

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || 'Home',
        customLabel: address.customLabel || '',
        recipientName: address.recipientName || '',
        recipientPhone: address.recipientPhone || '',
        fullAddress: address.fullAddress || '',
        isDefault: address.isDefault || false
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.recipientName.trim()) {
      errors.push('Recipient name is required');
    }
    
    if (!formData.recipientPhone.trim()) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.recipientPhone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (!formData.fullAddress.trim()) {
      errors.push('Full address is required');
    }
    
    if (formData.label === 'Other' && !formData.customLabel.trim()) {
      errors.push('Custom label is required when "Other" is selected');
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const addressData = {
        label: formData.label,
        customLabel: formData.label === 'Other' ? formData.customLabel : null,
        recipientName: formData.recipientName.trim(),
        recipientPhone: formData.recipientPhone.trim(),
        fullAddress: formData.fullAddress.trim(),
        isDefault: formData.isDefault
      };
      
      if (address) {
        await updateAddress(address.id, addressData);
      } else {
        await addAddress(addressData);
      }
      
      if (onSave) onSave();
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-organic-text">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Address Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Label *
            </label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              data-cy="address-label-select"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Label (if Other selected) */}
          {formData.label === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Label *
              </label>
              <input
                type="text"
                name="customLabel"
                value={formData.customLabel}
                onChange={handleChange}
                placeholder="e.g., Mom's House, Office"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
                data-cy="custom-label-input"
              />
            </div>
          )}

          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Name *
            </label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              placeholder="Full name of the person receiving the order"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              data-cy="recipient-name-input"
            />
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="recipientPhone"
              value={formData.recipientPhone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              data-cy="recipient-phone-input"
            />
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              rows={3}
              placeholder="House/Flat number, Street, Area, City, State, PIN Code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              data-cy="full-address-input"
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="mr-2 rounded border-gray-300 text-organic-primary focus:ring-organic-primary"
              data-cy="default-address-checkbox"
            />
            <label className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <LoadingButton
              type="submit"
              loading={loading}
              className="flex-1 bg-organic-primary text-white py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
              loadingText="Saving..."
              data-cy="save-address-button"
            >
              {address ? 'Update Address' : 'Save Address'}
            </LoadingButton>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              data-cy="cancel-address-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}