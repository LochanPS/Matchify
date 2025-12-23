/**
 * Simple in-memory cache with TTL support
 * Used for caching API responses to reduce network requests
 */
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 300000) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/not found
   */
  get(key) {
    const timestamp = this.timestamps.get(key);
    
    // Check if cache entry exists and hasn't expired
    if (!timestamp || Date.now() > timestamp) {
      // Expired - remove from cache
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Check if a key exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and hasn't expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param {string} pattern - Pattern to match (substring match)
   */
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const apiCache = new APICache();

export default APICache;