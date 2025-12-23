# Day 26: Enhanced Tournament Search & Category Filtering

**Date:** December 24, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Multi-category tournament search, advanced filtering, filter persistence

---

## Overview

Day 26 focuses on implementing enhanced search and filtering capabilities for the new multi-category tournament system. Players can now search tournaments by name, location, date, and available categories.

---

## Tasks (8 hours total)

### 1. Enhanced Tournament Search API (2 hours)

**Objective:** Create flexible search endpoint supporting multiple filters

#### 1.1 Search Endpoint

```javascript
// GET /tournaments/search
// Query Parameters:
// - q: string (search term - tournament name, venue)
// - city: string (filter by city)
// - date_from: string (YYYY-MM-DD)
// - date_to: string (YYYY-MM-DD)
// - category: string (filter by category name)
// - status: string (upcoming, live, completed)
// - limit: number (default: 20)
// - offset: number (default: 0)

Response: {
  tournaments: [
    {
      tournament_id: "uuid",
      tournament_name: "Weekend Badminton League",
      venue: "XYZ Sports Complex",
      city: "Bangalore",
      tournament_date: "2025-01-15",
      status: "upcoming",
      categories: [
        {
          category_id: "uuid",
          category_name: "Men's Singles",
          match_type: "singles",
          entry_fee: 200,
          current_participants: 8,
          max_participants: 16,
          status: "registration_open"
        },
        {
          category_id: "uuid",
          category_name: "Men's Doubles",
          match_type: "doubles",
          entry_fee: 300,
          current_participants: 6,
          max_participants: 8,
          status: "registration_open"
        }
      ]
    }
  ],
  pagination: {
    total: 42,
    limit: 20,
    offset: 0,
    hasMore: true
  }
}
```

#### 1.2 Backend Implementation

```javascript
// backend/controllers/tournamentController.js

exports.searchTournaments = async (req, res) => {
  try {
    const {
      q = '',
      city = '',
      date_from = '',
      date_to = '',
      category = '',
      status = 'upcoming',
      limit = 20,
      offset = 0,
    } = req.query;

    // Build query
    let query = `
      SELECT DISTINCT t.* FROM tournaments t
      LEFT JOIN categories c ON t.tournament_id = c.tournament_id
      WHERE t.status = $1
    `;
    const params = [status];
    let paramCount = 1;

    // Search by tournament name or venue
    if (q) {
      paramCount++;
      query += ` AND (t.tournament_name ILIKE $${paramCount} OR t.venue ILIKE $${paramCount})`;
      params.push(`%${q}%`);
    }

    // Filter by city
    if (city) {
      paramCount++;
      query += ` AND t.city = $${paramCount}`;
      params.push(city);
    }

    // Filter by date range
    if (date_from) {
      paramCount++;
      query += ` AND t.tournament_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND t.tournament_date <= $${paramCount}`;
      params.push(date_to);
    }

    // Filter by category
    if (category) {
      paramCount++;
      query += ` AND c.category_name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    // Order and paginate
    query += ` ORDER BY t.tournament_date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    // Get total count
    const countQuery = query.replace('SELECT DISTINCT t.*', 'SELECT COUNT(DISTINCT t.tournament_id)').split('LIMIT')[0];
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    // Get tournaments
    const result = await db.query(query, params);
    const tournaments = result.rows;

    // Get categories for each tournament
    const tournamentsWithCategories = await Promise.all(
      tournaments.map(async (tournament) => {
        const categoriesResult = await db.query(
          'SELECT * FROM categories WHERE tournament_id = $1 ORDER BY category_name',
          [tournament.tournament_id]
        );
        return {
          ...tournament,
          categories: categoriesResult.rows,
        };
      })
    );

    res.json({
      tournaments: tournamentsWithCategories,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + tournaments.length < total,
      },
    });
  } catch (error) {
    console.error('Search tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
```

**Files Modified:**
- `backend/routes/tournaments.js` - Add search route
- `backend/controllers/tournamentController.js` - Add search logic

---

### 2. Frontend Search Component (2 hours)

**Objective:** Create reusable search component with filters

#### 2.1 TournamentSearchBar Component

```javascript
// frontend/src/components/tournaments/TournamentSearchBar.jsx
import React, { useState, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { debounce } from '../../utils/debounce';

const TournamentSearchBar = ({ onSearch, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
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
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <TournamentFilters onSearch={onSearch} />
      )}
    </div>
  );
};

export default TournamentSearchBar;
```

#### 2.2 TournamentFilters Component

```javascript
// frontend/src/components/tournaments/TournamentFilters.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';

const TournamentFilters = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    city: '',
    date_from: '',
    date_to: '',
    category: '',
  });

  const categories = [
    "Men's Singles",
    "Women's Singles",
    "Men's Doubles",
    "Women's Doubles",
    "Mixed Doubles",
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      date_from: '',
      date_to: '',
      category: '',
    });
    onSearch({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          City
        </label>
        <input
          type="text"
          placeholder="Enter city"
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            From
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default TournamentFilters;
```

**Files Created:**
- `frontend/src/components/tournaments/TournamentSearchBar.jsx`
- `frontend/src/components/tournaments/TournamentFilters.jsx`

---

### 3. Debounce Utility (1 hour)

**Objective:** Create debounce utility for search optimization

```javascript
// frontend/src/utils/debounce.js
/**
 * Debounce function to delay execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default debounce;
```

**Files Created:**
- `frontend/src/utils/debounce.js`

---

### 4. Filter Persistence (1.5 hours)

**Objective:** Save and restore filter preferences

```javascript
// frontend/src/utils/filterStorage.js
/**
 * Filter storage utility for persisting user preferences
 */

const STORAGE_KEY = 'tournament_filters';

export const saveFilters = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters:', error);
  }
};

export const getFilters = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get filters:', error);
    return null;
  }
};

export const clearFilters = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear filters:', error);
  }
};
```

**Files Created:**
- `frontend/src/utils/filterStorage.js`

---

### 5. Update TournamentList Page (1.5 hours)

**Objective:** Integrate search and filters into tournament list

```javascript
// frontend/src/pages/player/TournamentList.jsx (Updated)
import { useState, useEffect, useRef, useCallback } from 'react';
import { tournamentAPI } from '../../services/api';
import TournamentSearchBar from '../../components/tournaments/TournamentSearchBar';
import { getFilters, saveFilters } from '../../utils/filterStorage';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = getFilters();
    if (savedFilters) {
      setFilters(savedFilters);
    }
  }, []);

  // Fetch tournaments when filters change
  useEffect(() => {
    fetchTournaments();
  }, [filters]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await tournamentAPI.search({
        ...filters,
        page: 1,
        limit: 20,
      });
      setTournaments(data.tournaments || []);
      setPage(1);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
        <TournamentSearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      {/* Tournament List */}
      <div className="px-4 py-4">
        {/* Results */}
        {tournaments.length > 0 ? (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.tournament_id} tournament={tournament} />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No tournaments found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TournamentList;
```

**Files Modified:**
- `frontend/src/pages/player/TournamentList.jsx`

---

### 6. Update API Service (1 hour)

**Objective:** Add search method to API service

```javascript
// frontend/src/services/api.js (Updated)

export const tournamentAPI = {
  // ... existing methods ...

  search: async (filters = {}) => {
    const { page = 1, limit = 20, ...filterParams } = filters;
    const offset = (page - 1) * limit;

    const queryParams = new URLSearchParams({
      ...filterParams,
      limit,
      offset,
    });

    const data = await apiCall(`/tournaments/search?${queryParams.toString()}`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(`tournaments_search_${JSON.stringify(filterParams)}_page_${page}`, data, 300000);
    return data;
  },
};
```

**Files Modified:**
- `frontend/src/services/api.js`

---

## Implementation Checklist

### Phase 1: Backend Search (2 hours)
- [ ] Create search endpoint
- [ ] Implement query building logic
- [ ] Add pagination support
- [ ] Test with various filters

### Phase 2: Frontend Components (2 hours)
- [ ] Create SearchBar component
- [ ] Create Filters component
- [ ] Implement debounce utility
- [ ] Test search functionality

### Phase 3: Filter Persistence (1.5 hours)
- [ ] Create filter storage utility
- [ ] Integrate with TournamentList
- [ ] Test filter persistence
- [ ] Verify localStorage

### Phase 4: Integration (1.5 hours)
- [ ] Update API service
- [ ] Update TournamentList page
- [ ] Test end-to-end search
- [ ] Verify infinite scroll with search

---

## Expected Results

### Before Day 26
- ❌ No search functionality
- ❌ No category filtering
- ❌ No filter persistence
- ❌ Limited tournament discovery

### After Day 26
- ✅ Full-text search on tournament names and venues
- ✅ Multi-category filtering
- ✅ Date range filtering
- ✅ City-based filtering
- ✅ Filter persistence across sessions
- ✅ Debounced search for performance
- ✅ Infinite scroll with search

---

## Success Criteria

- ✅ Search works across tournament names and venues
- ✅ Can filter by multiple categories
- ✅ Can filter by city and date range
- ✅ Filters persist across sessions
- ✅ Search is debounced (300ms)
- ✅ Results update instantly
- ✅ "Clear All Filters" button works
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Backend search: 2 hours
- Frontend components: 2 hours
- Filter persistence: 1.5 hours
- Integration & testing: 1.5 hours
- Buffer: 1 hour

**Total: 8 hours**

---

## Next Steps (Day 27)

- Category registration flow
- Doubles partner selection
- Registration confirmation
- Payment integration

---

**Status:** 🚀 Ready to execute  
**Date:** December 24, 2024  
**Duration:** 8 hours  
**Next:** Day 27 - Category Registration Flow

