// Algolia Search Configuration
import algoliasearch from 'algoliasearch';

const algoliaConfig = {
  appId: import.meta.env.VITE_ALGOLIA_APP_ID,
  searchKey: import.meta.env.VITE_ALGOLIA_SEARCH_KEY,
  adminKey: import.meta.env.VITE_ALGOLIA_ADMIN_KEY, // Only for server-side operations
  indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'ramro_products'
};

// Check if Algolia is configured
const isAlgoliaConfigured = algoliaConfig.appId && 
  algoliaConfig.searchKey && 
  !algoliaConfig.appId.includes('placeholder') && 
  !algoliaConfig.appId.includes('your_');

if (!isAlgoliaConfigured) {
  console.info('ℹ️ Algolia not configured yet. Advanced search features will be available once VITE_ALGOLIA_* variables are set.');
}

// Initialize Algolia client
let searchClient = null;
let searchIndex = null;

if (isAlgoliaConfigured) {
  try {
    searchClient = algoliasearch(algoliaConfig.appId, algoliaConfig.searchKey);
    searchIndex = searchClient.initIndex(algoliaConfig.indexName);
  } catch (error) {
    console.error('Failed to initialize Algolia:', error);
  }
}

// Search configuration
export const searchConfig = {
  // Search parameters
  hitsPerPage: 20,
  attributesToRetrieve: [
    'objectID',
    'name',
    'description', 
    'price',
    'image',
    'category',
    'rating',
    'quantityAvailable',
    'origin',
    'artisan'
  ],
  attributesToHighlight: [
    'name',
    'description'
  ],
  attributesToSnippet: [
    'description:20'
  ],
  
  // Faceting configuration
  attributesForFaceting: [
    'category',
    'origin',
    'artisan',
    'rating',
    'price'
  ],
  
  // Ranking configuration
  ranking: [
    'typo',
    'geo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'custom'
  ],
  
  // Custom ranking attributes
  customRanking: [
    'desc(rating)',
    'desc(quantityAvailable)',
    'asc(price)'
  ],
  
  // Typo tolerance
  typoTolerance: true,
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8,
  
  // Query rules for synonyms
  synonyms: [
    ['organic', 'natural', 'pure'],
    ['himalayan', 'mountain', 'high-altitude'],
    ['spicy', 'hot', 'chili'],
    ['sweet', 'honey', 'sugar']
  ]
};

export { algoliaConfig, searchClient, searchIndex, isAlgoliaConfigured };
export default algoliaConfig;