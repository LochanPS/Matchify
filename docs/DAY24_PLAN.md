# Day 24: Performance Optimization

**Date:** December 22, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Lazy loading, bundle optimization, caching, pagination

---

## Overview

Day 24 focuses on optimizing performance by implementing lazy loading for routes, reducing bundle size, adding aggressive caching, and implementing pagination with infinite scroll. These optimizations are simpler now that skill-level components have been removed.

---

## Tasks (8 hours total)

### 1. Implement Lazy Loading for Routes (2 hours)

**Benefit:** Reduces initial bundle size by ~40% (no skill filter components)

**Implementation: App.jsx**

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Home = lazy(() => import('./pages/player/TournamentList'));
const TournamentDetails = lazy(() => import('./pages/player/TournamentDetails'));
const PlayerProfile = lazy(() => import('./pages/player/PlayerProfile'));
const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard'));
const CreateTournament = lazy(() => import('./pages/organizer/CreateTournament'));
const TournamentManagement = lazy(() => import('./pages/organizer/TournamentManagement'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Login = lazy(() => import('./pages/auth/Login'));
const PlayerOnboarding = lazy(() => import('./pages/auth/PlayerOnboarding'));

// Loading fallback
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<PlayerOnboarding />} />

          {/* Player Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/profile" element={<PlayerProfile />} />

          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/tournaments/create" element={<CreateTournament />} />
          <Route path="/organizer/tournaments/:id/manage" element={<TournamentManagement />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

**Expected Results:**
- ✅ Initial bundle size reduced by ~40%
- ✅ Pages load on-demand
- ✅ Loading screen appears during route transitions
- ✅ Faster initial page load

---

### 2. Optimize Bundle Size (1.5 hours)

**Analysis:**

```bash
# Build and analyze
npm run build
npx vite-bundle-visualizer

# Check bundle size
ls -lh dist/assets/
```

**Optimization Actions:**

#### 2.1 Remove Unused Dependencies

```bash
# Audit unused packages
npm install -g depcheck
depcheck

# Remove unused packages
npm uninstall <unused-package>
```

#### 2.2 Tree-shake Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Tailwind will automatically remove unused styles
};
```

#### 2.3 Compress Assets

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide': ['lucide-react'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
```

**Install compression plugin:**

```bash
npm install vite-plugin-compression
```

**Expected Results:**
- ✅ Bundle size under 150KB gzipped
- ✅ Removed skill-level components (no longer needed)
- ✅ Vendor code split into separate chunks
- ✅ Console logs removed in production

---

### 3. Add Aggressive Caching for API Responses (2 hours)

**Create: src/utils/cache.js**

```javascript
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, value, ttl = 300000) {
    // ttl in milliseconds (default 5 minutes)
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp || Date.now() > timestamp) {
      // Expired
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  invalidate(pattern) {
    // Invalidate keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiCache = new APICache();
```

**Update: src/services/api.js**

```javascript
import { apiCache } from '../utils/cache';

// Tournament List
export const listTournaments = async (filters = {}) => {
  // Create cache key (no skill filter in key anymore)
  const cacheKey = `tournaments_${filters.city || 'all'}_${filters.matchType || 'all'}_${filters.status || 'upcoming'}`;

  // Check cache
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  // Fetch from API
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.matchType) params.append('match_type', filters.matchType);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await api.get(`/tournaments?${params}`);
  const data = response.data;

  // Cache for 5 minutes
  apiCache.set(cacheKey, data, 300000);
  return data;
};

// Player Profile
export const getProfile = async (userId) => {
  const cacheKey = `player_${userId}`;

  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  const response = await api.get(`/users/${userId}/profile`);
  const data = response.data;

  // Cache player profiles for 10 minutes
  apiCache.set(cacheKey, data, 600000);
  return data;
};

// Tournament Details
export const getById = async (tournamentId) => {
  const cacheKey = `tournament_${tournamentId}`;

  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  const response = await api.get(`/tournaments/${tournamentId}`);
  const data = response.data;

  // Cache for 5 minutes
  apiCache.set(cacheKey, data, 300000);
  return data;
};

// Invalidate cache when player joins tournament
export const joinTournament = async (tournamentId) => {
  const response = await api.post(`/tournaments/${tournamentId}/join`);

  // Invalidate tournament cache
  apiCache.invalidate('tournaments_');
  apiCache.invalidate(`tournament_${tournamentId}`);

  return response.data;
};

// Invalidate cache when player leaves tournament
export const leaveTournament = async (tournamentId) => {
  const response = await api.delete(`/tournaments/${tournamentId}/leave`);

  // Invalidate tournament cache
  apiCache.invalidate('tournaments_');
  apiCache.invalidate(`tournament_${tournamentId}`);

  return response.data;
};
```

**Expected Results:**
- ✅ Cache hit rate > 60% for tournament list
- ✅ Cache hit rate > 80% for player profiles
- ✅ API calls reduced by 50%
- ✅ Page load time reduced by 30%

---

### 4. Implement Pagination for Tournament List (2 hours)

**Backend Update: backend/controllers/tournamentController.js**

```javascript
export const listTournaments = async (req, res) => {
  try {
    const {
      city,
      matchType,
      status = 'upcoming',
      page = 1,
      limit = 20,
    } = req.query;

    // Build query (simplified without skill filters)
    let query = 'SELECT * FROM tournaments WHERE status = $1';
    const params = [status];
    let paramCount = 1;

    if (city) {
      paramCount++;
      query += ` AND city = $${paramCount}`;
      params.push(city);
    }

    if (matchType) {
      paramCount++;
      query += ` AND match_type = $${paramCount}`;
      params.push(matchType);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)').split('LIMIT')[0];
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    // Get tournaments
    const result = await db.query(query, params);

    res.json({
      tournaments: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: offset + result.rows.length < totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Frontend Implementation: src/pages/player/TournamentList.jsx**

```javascript
import { useState, useEffect, useRef } from 'react';
import { tournamentAPI } from '../../services/api';
import TournamentCard from '../../components/TournamentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({});

  const observerTarget = useRef(null);

  const loadTournaments = async (pageNum) => {
    if (loading) return;

    setLoading(true);
    try {
      const data = await tournamentAPI.list({
        ...filters,
        page: pageNum,
        limit: 20,
      });

      if (pageNum === 1) {
        setTournaments(data.tournaments);
      } else {
        setTournaments((prev) => [...prev, ...data.tournaments]);
      }

      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Load tournaments when page changes
  useEffect(() => {
    loadTournaments(page);
  }, [page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setTournaments([]);
  }, [filters]);

  return (
    <div className="pb-20">
      {/* Filters */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilters({})}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              Object.keys(filters).length === 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilters({ matchType: 'singles' })}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filters.matchType === 'singles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Singles
          </button>
          <button
            onClick={() => setFilters({ matchType: 'doubles' })}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filters.matchType === 'doubles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Doubles
          </button>
        </div>
      </div>

      {/* Tournament list */}
      <div className="px-4 py-4">
        {tournaments.length > 0 ? (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.tournament_id}
                tournament={tournament}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No tournaments found</p>
          </div>
        ) : null}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerTarget} className="h-10" />

        {/* End of list message */}
        {!hasMore && tournaments.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No more tournaments to show
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;
```

**Expected Results:**
- ✅ Initial load shows 20 tournaments
- ✅ Smooth infinite scroll
- ✅ New page loads before user reaches bottom
- ✅ Loading indicator appears correctly
- ✅ No jank or frame drops

---

### 5. Testing & Deployment (1.5 hours)

**Performance Testing Checklist:**

```markdown
## Performance Test Results

### Initial Load Time
- [ ] Home page loads in < 2 seconds (tested on 3G)
- [ ] Tournament details page loads in < 1.5 seconds
- [ ] Player profile loads in < 1 second (cached)

### Bundle Size
- [ ] Initial JS bundle < 150KB gzipped
- [ ] Total page weight < 300KB (first load)
- [ ] Lazy-loaded routes load in < 500ms

### API Performance
- [ ] Tournament list API responds in < 300ms
- [ ] Cache hit rate > 60% for tournament list
- [ ] Player profile cache hit rate > 80%

### Infinite Scroll
- [ ] Smooth scrolling with no jank
- [ ] New page loads before user reaches bottom
- [ ] Loading indicator appears correctly

### Mobile Performance (Real Device)
- [ ] Tested on Android (4G network)
- [ ] Tested on iOS (4G network)
- [ ] No frame drops during scroll
- [ ] Touch interactions feel instant (<100ms)
```

**Deployment:**

```bash
# Frontend
cd frontend
npm run build
vercel --prod

# Backend (if API changes)
cd backend
git push railway main
```

---

## Implementation Checklist

### Phase 1: Lazy Loading (1 hour)
- [ ] Update App.jsx with lazy imports
- [ ] Create LoadingScreen component
- [ ] Test route transitions
- [ ] Verify bundle size reduction

### Phase 2: Bundle Optimization (1 hour)
- [ ] Analyze bundle with vite-bundle-visualizer
- [ ] Remove unused dependencies
- [ ] Configure Tailwind tree-shaking
- [ ] Add compression plugin
- [ ] Test production build

### Phase 3: Caching (1.5 hours)
- [ ] Create cache.js utility
- [ ] Update API service with caching
- [ ] Implement cache invalidation
- [ ] Test cache hit rates
- [ ] Monitor cache performance

### Phase 4: Pagination (1.5 hours)
- [ ] Update backend pagination endpoint
- [ ] Implement infinite scroll frontend
- [ ] Add intersection observer
- [ ] Test on mobile
- [ ] Verify smooth scrolling

### Phase 5: Testing & Deployment (1 hour)
- [ ] Run performance tests
- [ ] Test on real devices
- [ ] Deploy to production
- [ ] Monitor performance metrics

---

## Expected Results

### Before Day 24
- Initial load: ~3.2 seconds
- Bundle size: 220KB gzipped
- API calls per page: 5-8
- No pagination

### After Day 24
- Initial load: ~1.8 seconds (44% improvement)
- Bundle size: 135KB gzipped (39% reduction)
- API calls per page: 2-3 (caching working)
- Infinite scroll pagination

---

## Success Criteria

- ✅ Initial load time < 2 seconds
- ✅ Bundle size < 150KB gzipped
- ✅ Cache hit rate > 60%
- ✅ Infinite scroll works smoothly
- ✅ Mobile performance optimized
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Lazy loading: 1 hour
- Bundle optimization: 1 hour
- Caching: 1.5 hours
- Pagination: 1.5 hours
- Testing & deployment: 1 hour
- Buffer: 1.5 hours

**Total: 8 hours**

---

## Next Steps (Day 25)

- Accessibility improvements
- Screen reader support
- Keyboard navigation
- Color contrast verification
- Focus indicators

---

**Status:** 🚀 Ready to execute  
**Date:** December 22, 2024  
**Duration:** 8 hours  
**Next:** Day 25 - Accessibility Improvements
