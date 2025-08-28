import React, { useState } from 'react';
import { seedArtisansToFirestore } from '../data/seedArtisans';
import { useArtisanStore } from '../store/artisanStore';

export default function ArtisanSeedButton() {
  const { artisans } = useArtisanStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');

  // Hide seed button if artisans already exist
  if (artisans.length > 0) {
    return null;
  }
  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    
    try {
      await seedArtisansToFirestore();
      setMessage('✅ Artisans seeded successfully!');
    } catch (error) {
      setMessage(`❌ Error seeding artisans: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Artisan Database Setup</h3>
      <p className="text-blue-700 mb-4 text-sm">
        Seed the database with artisan profiles and cultural stories. This will create the artisans collection.
      </p>
      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSeeding ? 'Seeding Artisans...' : 'Seed Artisan Profiles'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}