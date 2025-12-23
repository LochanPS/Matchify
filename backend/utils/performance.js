const { query } = require('../config/database');

// Database query optimization
class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  // Cache query results
  async cachedQuery(sql, params = [], cacheKey = null) {
    const key = cacheKey || this.generateCacheKey(sql, params);
    
    // Check cache first
    if (this.queryCache.has(key)) {
      const cached = this.queryCache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Cache hit for query: ${key}`);
        return cached.result;
      } else {
        this.queryCache.delete(key);
      }
    }
    
    // Execute query
    const start = Date.now();
    const result = await query(sql, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
    }
    
    // Cache result
    this.queryCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  generateCacheKey(sql, params) {
    return `${sql}_${JSON.stringify(params)}`.replace(/\s+/g, ' ').trim();
  }
  
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }
  
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }
}

// Global query optimizer instance
const queryOptimizer = new QueryOptimizer();

// Response compression middleware
const compressionMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only compress JSON responses larger than 1KB
    if (typeof data === 'object' && JSON.stringify(data).length > 1024) {
      res.set('Content-Encoding', 'gzip');
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Memory monitoring
class MemoryMonitor {
  constructor() {
    this.startMonitoring();
  }
  
  startMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      };
      
      // Log if memory usage is high
      if (memUsageMB.heapUsed > 100) {
        console.warn('High memory usage detected:', memUsageMB);
      }
      
      // Force garbage collection if available and memory is very high
      if (global.gc && memUsageMB.heapUsed > 200) {
        console.log('Forcing garbage collection...');
        global.gc();
      }
    }, 30000); // Check every 30 seconds
  }
  
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
  }
}

// Performance metrics collector
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.startTime = Date.now();
  }
  
  recordRequest(responseTime) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
  }
  
  recordError() {
    this.metrics.errors++;
  }
  
  recordSlowQuery() {
    this.metrics.slowQueries++;
  }
  
  recordCacheHit() {
    this.metrics.cacheHits++;
  }
  
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.metrics.requests > 0 
      ? this.metrics.totalResponseTime / this.metrics.requests 
      : 0;
    
    return {
      uptime: Math.round(uptime / 1000), // seconds
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 
        ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime: Math.round(avgResponseTime),
      slowQueries: this.metrics.slowQueries,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.startTime = Date.now();
  }
}

// Global performance metrics instance
const performanceMetrics = new PerformanceMetrics();
const memoryMonitor = new MemoryMonitor();

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Override res.send to capture response time
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - start;
    performanceMetrics.recordRequest(responseTime);
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Database connection pool optimization
const optimizeConnectionPool = (pool) => {
  // Monitor pool stats
  setInterval(() => {
    const stats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
    
    // Log if pool is under stress
    if (stats.waitingCount > 5) {
      console.warn('Database connection pool under stress:', stats);
    }
  }, 60000); // Check every minute
};

// API response optimization
const optimizeResponse = (data, req) => {
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret'];
  
  const cleanData = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(cleanData);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!sensitiveFields.includes(key.toLowerCase())) {
          cleaned[key] = cleanData(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  };
  
  return cleanData(data);
};

// Batch processing utility
class BatchProcessor {
  constructor(batchSize = 100, delay = 1000) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }
  
  add(item) {
    this.queue.push(item);
    
    if (!this.processing) {
      this.process();
    }
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      try {
        await this.processBatch(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
      
      // Delay between batches to prevent overwhelming the system
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
  }
  
  async processBatch(batch) {
    // Override this method in subclasses
    console.log(`Processing batch of ${batch.length} items`);
  }
}

// Health check utility
const healthCheck = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: memoryMonitor.getMemoryUsage(),
    performance: performanceMetrics.getStats(),
    database: null
  };
  
  try {
    // Test database connection
    const dbTest = await query('SELECT 1 as test');
    health.database = dbTest.rows.length > 0 ? 'connected' : 'disconnected';
  } catch (error) {
    health.database = 'error';
    health.status = 'unhealthy';
  }
  
  return health;
};

module.exports = {
  queryOptimizer,
  compressionMiddleware,
  memoryMonitor,
  performanceMetrics,
  performanceMiddleware,
  optimizeConnectionPool,
  optimizeResponse,
  BatchProcessor,
  healthCheck
};