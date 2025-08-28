import { useState, useEffect, useCallback } from 'react';
+import { searchService } from '../services/searchService';
+
+export const useAlgoliaSearch = () => {
+  const [results, setResults] = useState(null);
+  const [isLoading, setIsLoading] = useState(false);
+  const [error, setError] = useState(null);
+  const [query, setQuery] = useState('');
+  const [filters, setFilters] = useState({});
+
+  const search = useCallback(async (searchQuery, searchFilters = {}) => {
+    if (!searchQuery.trim()) {
+      setResults(null);
+      setQuery('');
+      return;
+    }
+
+    setIsLoading(true);
+    setError(null);
+    setQuery(searchQuery);
+    setFilters(searchFilters);
+
+    try {
+      const searchResults = await searchService.searchProducts(searchQuery, searchFilters);
+      
+      setResults({
+        products: searchResults.hits,
+        totalResults: searchResults.nbHits,
+        query: searchQuery,
+        processingTime: searchResults.processingTimeMS,
+        facets: searchResults.facets,
+        page: searchResults.page,
+        nbPages: searchResults.nbPages
+      });
+    } catch (err) {
+      setError(err.message);
+      setResults(null);
+    } finally {
+      setIsLoading(false);
+    }
+  }, []);
+
+  const clearSearch = useCallback(() => {
+    setResults(null);
+    setQuery('');
+    setFilters({});
+    setError(null);
+    setIsLoading(false);
+  }, []);
+
+  const updateFilters = useCallback(async (newFilters) => {
+    if (query) {
+      await search(query, newFilters);
+    }
+  }, [query, search]);
+
+  return {
+    results,
+    isLoading,
+    error,
+    query,
+    filters,
+    search,
+    clearSearch,
+    updateFilters
+  };
+};
+
+export default useAlgoliaSearch;
+