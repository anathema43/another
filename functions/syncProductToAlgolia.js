const functions = require('firebase-functions');
+const admin = require('firebase-admin');
+const algoliasearch = require('algoliasearch');
+
+// Initialize Algolia
+const client = algoliasearch(
+  functions.config().algolia.app_id,
+  functions.config().algolia.admin_key
+);
+const index = client.initIndex('ramro_products');
+
+/**
+ * Firebase Function to sync product changes to Algolia
+ * Triggers on any write to the products collection
+ */
+exports.syncProductToAlgolia = functions.firestore
+  .document('products/{productId}')
+  .onWrite(async (change, context) => {
+    const productId = context.params.productId;
+    
+    try {
+      // Handle deletion
+      if (!change.after.exists) {
+        console.log(`Deleting product ${productId} from Algolia`);
+        await index.deleteObject(productId);
+        return;
+      }
+
+      // Handle creation or update
+      const productData = change.after.data();
+      
+      // Prepare data for Algolia indexing
+      const algoliaObject = {
+        objectID: productId,
+        name: productData.name,
+        description: productData.description,
+        price: productData.price,
+        image: productData.image,
+        category: productData.category,
+        rating: productData.rating || 0,
+        reviewCount: productData.reviewCount || 0,
+        quantityAvailable: productData.quantityAvailable,
+        origin: productData.origin,
+        artisan: productData.artisan,
+        featured: productData.featured || false,
+        tags: generateSearchTags(productData),
+        createdAt: productData.createdAt,
+        updatedAt: productData.updatedAt || admin.firestore.FieldValue.serverTimestamp()
+      };
+
+      console.log(`Syncing product ${productId} to Algolia`);
+      await index.saveObject(algoliaObject);
+      
+      console.log(`Successfully synced product ${productId} to Algolia`);
+    } catch (error) {
+      console.error(`Error syncing product ${productId} to Algolia:`, error);
+      throw error;
+    }
+  });
+
+/**
+ * Bulk sync all products to Algolia
+ * Can be triggered manually for initial setup
+ */
+exports.bulkSyncProductsToAlgolia = functions.https.onCall(async (data, context) => {
+  // Verify admin access
+  if (!context.auth || !context.auth.token.admin) {
+    throw new functions.https.HttpsError(
+      'permission-denied',
+      'Only admins can perform bulk sync operations.'
+    );
+  }
+
+  try {
+    console.log('Starting bulk sync of products to Algolia');
+    
+    // Get all products from Firestore
+    const productsSnapshot = await admin.firestore().collection('products').get();
+    const algoliaObjects = [];
+
+    productsSnapshot.forEach(doc => {
+      const productData = doc.data();
+      algoliaObjects.push({
+        objectID: doc.id,
+        name: productData.name,
+        description: productData.description,
+        price: productData.price,
+        image: productData.image,
+        category: productData.category,
+        rating: productData.rating || 0,
+        reviewCount: productData.reviewCount || 0,
+        quantityAvailable: productData.quantityAvailable,
+        origin: productData.origin,
+        artisan: productData.artisan,
+        featured: productData.featured || false,
+        tags: generateSearchTags(productData),
+        createdAt: productData.createdAt,
+        updatedAt: productData.updatedAt
+      });
+    });
+
+    // Clear existing index and add all products
+    await index.clearObjects();
+    await index.saveObjects(algoliaObjects);
+
+    console.log(`Successfully synced ${algoliaObjects.length} products to Algolia`);
+    
+    return {
+      success: true,
+      message: `Synced ${algoliaObjects.length} products to Algolia`,
+      count: algoliaObjects.length
+    };
+  } catch (error) {
+    console.error('Error in bulk sync:', error);
+    throw new functions.https.HttpsError(
+      'internal',
+      'Failed to sync products to Algolia',
+      error.message
+    );
+  }
+});
+
+/**
+ * Configure Algolia index settings
+ */
+exports.configureAlgoliaIndex = functions.https.onCall(async (data, context) => {
+  // Verify admin access
+  if (!context.auth || !context.auth.token.admin) {
+    throw new functions.https.HttpsError(
+      'permission-denied',
+      'Only admins can configure search index.'
+    );
+  }
+
+  try {
+    const settings = {
+      searchableAttributes: [
+        'name',
+        'description',
+        'category',
+        'origin',
+        'artisan',
+        'tags'
+      ],
+      attributesForFaceting: [
+        'filterOnly(category)',
+        'filterOnly(origin)',
+        'filterOnly(artisan)',
+        'rating',
+        'price'
+      ],
+      customRanking: [
+        'desc(rating)',
+        'desc(quantityAvailable)',
+        'asc(price)'
+      ],
+      ranking: [
+        'typo',
+        'geo',
+        'words',
+        'filters',
+        'proximity',
+        'attribute',
+        'exact',
+        'custom'
+      ],
+      typoTolerance: true,
+      minWordSizefor1Typo: 4,
+      minWordSizefor2Typos: 8,
+      hitsPerPage: 20,
+      maxValuesPerFacet: 100
+    };
+
+    await index.setSettings(settings);
+    
+    console.log('Algolia index configured successfully');
+    
+    return {
+      success: true,
+      message: 'Algolia index configured successfully'
+    };
+  } catch (error) {
+    console.error('Error configuring Algolia index:', error);
+    throw new functions.https.HttpsError(
+      'internal',
+      'Failed to configure search index',
+      error.message
+    );
+  }
+});
+
+/**
+ * Generate search tags for better discoverability
+ */
+function generateSearchTags(product) {
+  const tags = [];
+
+  // Add category-based tags
+  if (product.category) {
+    tags.push(product.category);
+  }
+
+  // Add origin-based tags
+  if (product.origin) {
+    const originParts = product.origin.split(',');
+    tags.push(...originParts.map(part => part.trim().toLowerCase()));
+  }
+
+  // Add price-based tags
+  if (product.price < 200) tags.push('budget-friendly');
+  else if (product.price > 500) tags.push('premium');
+
+  // Add rating-based tags
+  if (product.rating >= 4.5) tags.push('highly-rated');
+  else if (product.rating >= 4) tags.push('well-rated');
+
+  // Add availability tags
+  if (product.quantityAvailable > 10) tags.push('in-stock');
+  else if (product.quantityAvailable > 0) tags.push('limited-stock');
+  else tags.push('out-of-stock');
+
+  // Add feature tags
+  if (product.featured) tags.push('featured');
+
+  return tags;
+}
+