import React, { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import AddressCard from './AddressCard';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AddressBook({ 
  onAddressSelect = null, 
  selectedAddressId = null, 
  onAddNewAddress,
  showAddButton = true,
  selectionMode = false 
}) {
  const { addresses, fetchAddresses, loading, error } = useUserStore();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading addresses: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-cy="address-book">
      {/* Add New Address Button */}
      {showAddButton && (
        <button
          onClick={onAddNewAddress}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-organic-primary hover:bg-organic-background transition-colors text-center"
          data-cy="add-address-button"
        >
          <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span className="text-gray-600 font-medium">Add New Address</span>
        </button>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No addresses saved yet.</p>
          <p className="text-sm">Add your first address to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={onAddressSelect ? () => onAddressSelect(address) : null}
              selectionMode={selectionMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}