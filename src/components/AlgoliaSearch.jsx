import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchService } from '../services/searchService';
import { useProductStore } from '../store/productStore';

export default function AlgoliaSearch({ onResults, onClear, className = '' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [trending, setTrending] = useState([]);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Load trending searches on mount
    const trendingSearches = searchService.getTrendingSearches();
    setTrending(trendingSearches.slice(0, 6));
  }, []);

  useEffect(() => {
    // Debounced search suggestions
    const timeoutId = setTimeout(async () => {
      if (query.length >= 2) {
        try {
          const suggestions = await searchService.getSearchSuggestions(query);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    // Debounced instant search
    const timeoutId = setTimeout(async () => {
      if (query.length >= 1) {
        await performSearch(query);
      } else if (query.length === 0) {
        handleClear();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery, filters = {}) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchService.searchProducts(searchQuery, filters);
      
      if (onResults) {
        onResults({
          products: results.hits,
          totalResults: results.nbHits,
          query: searchQuery,
          processingTime: results.processingTimeMS,
          facets: results.facets
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      if (onResults) {
        onResults({
          products: [],
          totalResults: 0,
          query: searchQuery,
          error: error.message
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.query);
    setShowSuggestions(false);
    performSearch(suggestion.query);
    
    // Track click
    searchService.trackClick(suggestion.query, query, 0);
  };

  const handleTrendingClick = (trendingQuery) => {
    setQuery(trendingQuery);
    setShowSuggestions(false);
    performSearch(trendingQuery);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      performSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true);
    } else if (query.length === 0) {
      setShowSuggestions(true); // Show trending searches
    }
  };

  return (
    <div className={`relative ${className}`} data-cy="algolia-search-container">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search products... (try 'himalayan honey')"
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-organic-primary focus:border-transparent"
          data-cy="algolia-search-input"
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              data-cy="clear-search-button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {isSearching && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-organic-primary"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          data-cy="autocomplete-dropdown"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between"
                  data-cy="suggestion-item"
                >
                  <span 
                    dangerouslySetInnerHTML={{ __html: suggestion.highlighted }}
                    className="text-gray-900"
                  />
                  {suggestion.nbHits > 0 && (
                    <span className="text-xs text-gray-500">
                      {suggestion.nbHits} results
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {query.length === 0 && trending.length > 0 && (
            <div className="p-2 border-t border-gray-100" data-cy="trending-searches">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">Trending Searches</div>
              {trending.map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(trend.query)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between"
                  data-cy="trending-item"
                >
                  <span className="text-gray-900">{trend.query}</span>
                  <span className="text-xs text-gray-500">🔥</span>
                </button>
              ))}
            </div>
          )}

          {/* No Suggestions */}
          {query.length >= 2 && suggestions.length === 0 && !isSearching && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No suggestions found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}