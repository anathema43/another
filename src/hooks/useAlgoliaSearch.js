import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';

export const useAlgoliaSearch = (initialQuery = '', category = null) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const search = useCallback(async (searchQuery = query, filters = {}) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add category filter if specified
      const searchFilters = { ...filters };
      if (category) {
        searchFilters.categories = [category.slug || category];
      }

      const searchResults = await searchService.searchProducts(searchQuery, searchFilters);
      
      setResults({
        products: searchResults.hits,
        totalResults: searchResults.nbHits,
        query: searchQuery,
        processingTime: searchResults.processingTimeMS,
        facets: searchResults.facets
      });
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionResults = await searchService.getSearchSuggestions(searchQuery);
      setSuggestions(suggestionResults);
    } catch (err) {
      console.error('Error getting suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setSuggestions([]);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 1) {
        search(query);
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  // Debounced suggestions effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, getSuggestions]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    suggestions,
    search,
    clearSearch
  };
};