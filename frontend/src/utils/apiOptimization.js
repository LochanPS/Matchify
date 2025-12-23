// Frontend API optimization utilities

// Client-side API caching
class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.maxSize = 100; // Maximum number of cached responses
  }
  
  set(key, data, ttlMs = 300000) { // 5 minutes default TTL
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.ttl.delete(firstKey);
    }
    
    this.cache.set(key, data);
    this.ttl.set(key, Date.now() + ttlMs);
  }
  
  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || expiry < Date.now()) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    // Move to end for LRU
    const data = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, data);
    
    return data;
  }
  
  invalidate(pattern) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.ttl.delete(key);
    });
    
    return keysToDelete.length;
  }
  
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}

// Global API cache instance
const apiCache = new APICache();

// Request deduplication to prevent duplicate API calls
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }
  
  async dedupe(key, requestFn) {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    // Create new request
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

const requestDeduplicator = new RequestDeduplicator();

// Performance monitoring for API calls
class APIPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.recentCalls = [];
  }
  
  recordCall(endpoint, duration, success, cacheHit = false) {
    const key = `${endpoint}:${success ? 'success' : 'error'}`;
    const current = this.metrics.get(key) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      cacheHits: 0
    };
    
    current.count++;
    current.totalTime += duration;
    current.minTime = Math.min(current.minTime, duration);
    current.maxTime = Math.max(current.maxTime, duration);
    current.avgTime = current.totalTime / current.count;
    
    if (cacheHit) {
      current.cacheHits++;
    }
    
    this.metrics.set(key, current);
    
    // Keep recent calls for debugging
    this.recentCalls.push({
      endpoint,
      duration,
      success,
      cacheHit,
      timestamp: Date.now()
    });
    
    // Keep only last 50 calls
    if (this.recentCalls.length > 50) {
      this.recentCalls.shift();
    }
    
    // Log slow API calls
    if (duration > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }
  }
  
  getMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = {
        ...value,
        cacheHitRate: value.cacheHits / value.count
      };
    });
    return result;
  }
  
  getRecentCalls() {
    return this.recentCalls.slice(-20);
  }
}

const apiMonitor = new APIPerformanceMonitor();

// Optimized fetch wrapper with caching and monitoring
const optimizedFetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  const cacheKey = `${method}:${url}:${JSON.stringify(options.body || {})}`;
  const startTime = Date.now();
  
  // Check cache for GET requests
  if (method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      apiMonitor.recordCall(url, duration, true, true);
      return { ...cached, fromCache: true };
    }
  }
  
  try {
    // Use request deduplication for GET requests
    const response = method === 'GET' 
      ? await requestDeduplicator.dedupe(cacheKey, () => fetch(url, options))
      : await fetch(url, options);
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      apiMonitor.recordCall(url, duration, false);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    apiMonitor.recordCall(url, duration, true);
    
    // Cache successful GET requests
    if (method === 'GET' && data.success) {
      const ttl = getCacheTTL(url);
      apiCache.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    apiMonitor.recordCall(url, duration, false);
    throw error;
  }
};

// Determine cache TTL based on endpoint
const getCacheTTL = (url) => {
  if (url.includes('/tournaments') && !url.includes('/matches')) {
    return 180000; // 3 minutes for tournament lists
  }
  if (url.includes('/profile') || url.includes('/stats')) {
    return 300000; // 5 minutes for profiles
  }
  if (url.includes('/matches')) {
    return 60000; // 1 minute for match data
  }
  return 120000; // 2 minutes default
};

// Optimized API service
export const optimizedAPI = {
  // Tournament endpoints
  async getTournaments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/tournaments${queryString ? `?${queryString}` : ''}`;
    return optimizedFetch(url);
  },
  
  async getTournamentDetails(id) {
    return optimizedFetch(`/api/tournaments/${id}`);
  },
  
  async getTournamentMatches(id) {
    return optimizedFetch(`/api/tournaments/${id}/matches`);
  },
  
  // Player endpoints
  async getPlayerProfile(id) {
    return optimizedFetch(`/api/users/${id}/profile`);
  },
  
  async getPlayerStats(id) {
    return optimizedFetch(`/api/users/${id}/stats`);
  },
  
  // Registration endpoints
  async registerForTournament(tournamentId, data) {
    const response = await optimizedFetch(`/api/tournaments/${tournamentId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Invalidate related caches
    apiCache.invalidate(`tournaments/${tournamentId}`);
    apiCache.invalidate('tournaments?');
    
    return response;
  },
  
  // Tournament creation/editing
  async createTournament(data) {
    const response = await optimizedFetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Invalidate tournament list caches
    apiCache.invalidate('tournaments?');
    
    return response;
  },
  
  async updateTournament(id, data) {
    const response = await optimizedFetch(`/api/tournaments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Invalidate specific tournament caches
    apiCache.invalidate(`tournaments/${id}`);
    apiCache.invalidate('tournaments?');
    
    return response;
  },
  
  // Match management
  async updateMatchScore(matchId, data) {
    const response = await optimizedFetch(`/api/matches/${matchId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Invalidate match and tournament caches
    apiCache.invalidate('matches');
    apiCache.invalidate('tournaments');
    
    return response;
  },
  
  // Utility methods
  clearCache() {
    apiCache.clear();
  },
  
  invalidateCache(pattern) {
    return apiCache.invalidate(pattern);
  },
  
  getPerformanceMetrics() {
    return {
      api: apiMonitor.getMetrics(),
      cache: apiCache.getStats(),
      recentCalls: apiMonitor.getRecentCalls()
    };
  }
};

// Batch API requests to reduce network overhead
export class BatchRequestManager {
  constructor(batchSize = 5, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }
  
  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (!this.processing) {
        setTimeout(() => this.processBatch(), this.delay);
      }
    });
  }
  
  async processBatch() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      try {
        // Execute requests in parallel
        const promises = batch.map(({ request }) => request());
        const results = await Promise.allSettled(promises);
        
        // Resolve/reject individual promises
        results.forEach((result, index) => {
          const { resolve, reject } = batch[index];
          if (result.status === 'fulfilled') {
            resolve(result.value);
          } else {
            reject(result.reason);
          }
        });
      } catch (error) {
        // Reject all requests in batch if batch processing fails
        batch.forEach(({ reject }) => reject(error));
      }
      
      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.processing = false;
  }
}

// Global batch manager
export const batchManager = new BatchRequestManager();

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    // Preload upcoming tournaments
    const upcomingTournaments = optimizedAPI.getTournaments({ 
      status: 'upcoming', 
      limit: 10 
    });
    
    // Preload user profile if authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      const userProfile = optimizedAPI.getPlayerProfile('me');
      await Promise.all([upcomingTournaments, userProfile]);
    } else {
      await upcomingTournaments;
    }
    
    console.log('Critical data preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
};

// Network status monitoring
export const networkMonitor = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored');
      // Retry failed requests or refresh data
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost');
    });
  },
  
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return { effectiveType: 'unknown' };
  }
};

// Initialize network monitoring
networkMonitor.init();

export default optimizedAPI;