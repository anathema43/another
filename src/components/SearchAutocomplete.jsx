import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import { searchService } from '../services/searchService';

export default function SearchAutocomplete({ 
  onSearch, 
  onSuggestionClick,
  placeholder = "Search products...",
  className = '' 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('ramro_recent_searches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);

  useEffect(() => {
    // Debounced suggestions fetch
    const timeoutId = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const suggestions = await searchService.getSearchSuggestions(query);
          setSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(true);
  };

  const handleKeyDown = (e) => {
    const allItems = [...suggestions, ...recentSearches];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          handleItemSelect(allItems[selectedIndex].query || allItems[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleItemSelect = (selectedQuery) => {
    setQuery(selectedQuery);
    setShowDropdown(false);
    saveRecentSearch(selectedQuery);
    
    if (onSuggestionClick) {
      onSuggestionClick(selectedQuery);
    } else {
      handleSearch(selectedQuery);
    }
  };

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setShowDropdown(false);
    saveRecentSearch(searchQuery);
    
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const recent = JSON.parse(localStorage.getItem('ramro_recent_searches') || '[]');
    const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 10);
    localStorage.setItem('ramro_recent_searches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('ramro_recent_searches');
    setRecentSearches([]);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  return (
    <div className={`relative ${className}`} data-cy="search-autocomplete">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-organic-primary focus:border-transparent"
          data-cy="autocomplete-input"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          data-cy="autocomplete-dropdown"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-organic-primary mx-auto"></div>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleItemSelect(suggestion.query)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
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

          {/* Recent Searches */}
          {!isLoading && query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-medium text-gray-500">Recent Searches</div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleItemSelect(search)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center hover:bg-gray-50 ${
                    selectedIndex === suggestions.length + index ? 'bg-gray-50' : ''
                  }`}
                  data-cy="recent-search-item"
                >
                  <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No suggestions found</div>
              <div className="text-xs mt-1">Press Enter to search anyway</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}