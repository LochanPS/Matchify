import React, { useState, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { debounce } from '../../utils/debounce';
import TournamentFilters from './TournamentFilters';

/**
 * Tournament search bar component with filters
 * Provides search and filtering capabilities for tournaments
 */
const TournamentSearchBar = ({ onSearch, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      onSearch({ q: query });
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch({ q: '' });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tournaments, venues..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Filters Panel */}
      {showFilters && <TournamentFilters onSearch={onSearch} />}
    </div>
  );
};

export default TournamentSearchBar;
