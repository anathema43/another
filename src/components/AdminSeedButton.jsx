import React, { useState } from 'react';
import { seedProductsToFirestore } from '../data/seedProducts';
import { useProductStore } from '../store/productStore';

export default function AdminSeedButton() {
  const { products } = useProductStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');

  // Hide seed button if products already exist
  if (products.length > 0) {
    return null;
  }
  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    
    try {
      await seedProductsToFirestore();
      setMessage('✅ Products seeded successfully!');
    } catch (error) {
      setMessage(`❌ Error seeding products: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Database Setup</h3>
      <p className="text-yellow-700 mb-4 text-sm">
        Seed the database with initial product data. This will replace existing products.
      </p>
      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSeeding ? 'Seeding...' : 'Seed Products'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}