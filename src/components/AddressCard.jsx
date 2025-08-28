import React from 'react';
import { useUserStore } from '../store/userStore';
import { PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AddressCard({ 
  address, 
  isSelected = false, 
  onSelect = null, 
  onEdit = null, 
  onDelete = null,
  selectionMode = false 
}) {
  const { deleteAddress, setDefaultAddress } = useUserStore();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(address);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        if (onDelete) {
          onDelete(address.id);
        } else {
          await deleteAddress(address.id);
        }
      } catch (error) {
        alert('Error deleting address: ' + error.message);
      }
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefaultAddress(address.id);
    } catch (error) {
      alert('Error setting default address: ' + error.message);
    }
  };

  const displayLabel = address.label === 'Other' && address.customLabel 
    ? address.customLabel 
    : address.label;

  return (
    <div 
      className={`border rounded-lg p-4 transition-all cursor-pointer ${
        isSelected 
          ? 'border-organic-primary bg-organic-primary bg-opacity-5' 
          : 'border-gray-200 hover:border-gray-300'
      } ${selectionMode ? 'hover:bg-gray-50' : ''}`}
      onClick={selectionMode && onSelect ? onSelect : undefined}
      data-cy="address-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              address.label === 'Home' ? 'bg-green-100 text-green-800' :
              address.label === 'Work' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {displayLabel}
            </span>
            {address.isDefault && (
              <span className="bg-organic-primary text-white px-2 py-1 text-xs rounded-full">
                Default
              </span>
            )}
            {isSelected && (
              <CheckCircleIcon className="w-5 h-5 text-organic-primary" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-organic-text">{address.recipientName}</p>
            <p className="text-sm text-gray-600">{address.recipientPhone}</p>
            <p className="text-sm text-gray-700">{address.fullAddress}</p>
          </div>
        </div>

        {!selectionMode && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit Address"
              data-cy="edit-address-button"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Address"
              data-cy="delete-address-button"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!selectionMode && !address.isDefault && (
        <div className="mt-3 pt-3 border-t">
          <button
            onClick={handleSetDefault}
            className="text-sm text-organic-primary hover:text-organic-text font-medium"
            data-cy="set-default-button"
          >
            Set as Default
          </button>
        </div>
      )}
    </div>
  );
}