import React, { useState } from 'react';
import { CloudArrowUpIcon, Cog6ToothIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { searchService } from '../services/searchService';
import { useProductStore } from '../store/productStore';
import { isAlgoliaConfigured } from '../config/algolia';

export default function AdminAlgoliaSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [configResult, setConfigResult] = useState(null);
  const { products } = useProductStore();

  // Hide Algolia sync if not configured
  if (!isAlgoliaConfigured) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          🔍 Algolia Search (Optional)
        </h3>
        <p className="text-blue-700 text-sm">
          Algolia is not configured yet. Add VITE_ALGOLIA_* environment variables to enable advanced search features.
        </p>
      </div>
    );
  }
  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Sync all products to Algolia
      const result = await searchService.bulkIndexProducts(products);
      
      setSyncResult({
        success: true,
        message: `Successfully synced ${products.length} products to Algolia`,
        count: products.length
      });
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Error syncing products: ${error.message}`,
        count: 0
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfigureIndex = async () => {
    setIsConfiguring(true);
    setConfigResult(null);

    try {
      await searchService.configureIndex();
      
      setConfigResult({
        success: true,
        message: 'Algolia index configured successfully'
      });
    } catch (error) {
      setConfigResult({
        success: false,
        message: `Error configuring index: ${error.message}`
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const getSearchAnalytics = () => {
    return searchService.getSearchAnalytics();
  };

  const analytics = getSearchAnalytics();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        🔍 Algolia Search Management
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sync Section */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Product Synchronization</h4>
          <p className="text-sm text-gray-600 mb-4">
            Sync all products from Firestore to Algolia search index for advanced search capabilities.
          </p>
          
          <button
            onClick={handleBulkSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            {isSyncing ? 'Syncing...' : `Sync ${products.length} Products`}
          </button>

          {syncResult && (
            <div className={`mt-3 p-3 rounded-lg ${
              syncResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{syncResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Section */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Index Configuration</h4>
          <p className="text-sm text-gray-600 mb-4">
            Configure Algolia index settings for optimal search performance and relevance.
          </p>
          
          <button
            onClick={handleConfigureIndex}
            disabled={isConfiguring}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            {isConfiguring ? 'Configuring...' : 'Configure Index'}
          </button>

          {configResult && (
            <div className={`mt-3 p-3 rounded-lg ${
              configResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {configResult.success ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{configResult.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-6 bg-white p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Search Analytics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.queries.length}</div>
            <div className="text-sm text-gray-600">Total Searches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.clicks.length}</div>
            <div className="text-sm text-gray-600">Search Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.clickThroughRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Click-through Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-4 text-sm text-blue-700">
        <p><strong>Setup Instructions:</strong></p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Create an Algolia account and get your API keys</li>
          <li>Add VITE_ALGOLIA_* environment variables</li>
          <li>Configure the index settings</li>
          <li>Sync your products to enable advanced search</li>
        </ol>
      </div>
    </div>
  );
}