/**
 * MATCHIFY Monitoring Configuration
 * Tracks performance metrics, errors, and system health
 */

const performanceMetrics = {
  apiCalls: [],
  dbQueries: [],
  errors: {},
  startTime: Date.now(),

  recordApiCall: (endpoint, method, duration, statusCode) => {
    performanceMetrics.apiCalls.push({
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date(),
    });

    // Keep only last 1000 calls
    if (performanceMetrics.apiCalls.length > 1000) {
      performanceMetrics.apiCalls.shift();
    }
  },

  recordDbQuery: (query, duration) => {
    performanceMetrics.dbQueries.push({
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      timestamp: new Date(),
    });

    // Keep only last 500 queries
    if (performanceMetrics.dbQueries.length > 500) {
      performanceMetrics.dbQueries.shift();
    }
  },

  recordError: (errorType, message, statusCode) => {
    const key = `${errorType}_${statusCode}`;
    if (!performanceMetrics.errors[key]) {
      performanceMetrics.errors[key] = {
        count: 0,
        lastOccurred: null,
        message: message,
      };
    }
    performanceMetrics.errors[key].count++;
    performanceMetrics.errors[key].lastOccurred = new Date();
  },

  getStats: () => {
    const apiTimes = performanceMetrics.apiCalls.map((c) => c.duration);
    const dbTimes = performanceMetrics.dbQueries.map((q) => q.duration);

    const calculatePercentile = (arr, percentile) => {
      if (arr.length === 0) return 0;
      const sorted = arr.sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[index];
    };

    return {
      uptime: Math.floor((Date.now() - performanceMetrics.startTime) / 1000),
      apiMetrics: {
        totalCalls: performanceMetrics.apiCalls.length,
        avgResponseTime: apiTimes.length > 0 ? Math.round(apiTimes.reduce((a, b) => a + b) / apiTimes.length) : 0,
        p50: calculatePercentile([...apiTimes], 50),
        p95: calculatePercentile([...apiTimes], 95),
        p99: calculatePercentile([...apiTimes], 99),
        maxResponseTime: apiTimes.length > 0 ? Math.max(...apiTimes) : 0,
      },
      dbMetrics: {
        totalQueries: performanceMetrics.dbQueries.length,
        avgQueryTime: dbTimes.length > 0 ? Math.round(dbTimes.reduce((a, b) => a + b) / dbTimes.length) : 0,
        p50: calculatePercentile([...dbTimes], 50),
        p95: calculatePercentile([...dbTimes], 95),
        p99: calculatePercentile([...dbTimes], 99),
        maxQueryTime: dbTimes.length > 0 ? Math.max(...dbTimes) : 0,
      },
      errors: performanceMetrics.errors,
      errorCount: Object.values(performanceMetrics.errors).reduce((sum, e) => sum + e.count, 0),
      errorRate: performanceMetrics.apiCalls.length > 0
        ? ((Object.values(performanceMetrics.errors).reduce((sum, e) => sum + e.count, 0) / performanceMetrics.apiCalls.length) * 100).toFixed(2)
        : 0,
    };
  },

  reset: () => {
    performanceMetrics.apiCalls = [];
    performanceMetrics.dbQueries = [];
    performanceMetrics.errors = {};
  },
};

// Memory monitoring
const memoryMonitor = {
  getMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      heapUsagePercent: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2),
    };
  },

  checkMemoryHealth: () => {
    const usage = memoryMonitor.getMemoryUsage();
    const heapUsagePercent = parseFloat(usage.heapUsagePercent);

    if (heapUsagePercent > 90) {
      return { status: 'critical', message: 'Heap usage critical' };
    } else if (heapUsagePercent > 80) {
      return { status: 'warning', message: 'Heap usage high' };
    } else {
      return { status: 'healthy', message: 'Heap usage normal' };
    }
  },
};

// Health check
const healthCheck = async (db) => {
  try {
    // Check database connection
    const dbResult = await db.query('SELECT 1');
    const dbHealthy = dbResult.rows.length > 0;

    // Get memory usage
    const memory = memoryMonitor.getMemoryUsage();
    const memoryHealthy = parseFloat(memory.heapUsagePercent) < 90;

    // Get performance stats
    const stats = performanceMetrics.getStats();
    const performanceHealthy = stats.errorRate < 5;

    return {
      status: dbHealthy && memoryHealthy && performanceHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      memory: memory,
      memoryStatus: memoryMonitor.checkMemoryHealth().status,
      performance: {
        avgApiTime: stats.apiMetrics.avgResponseTime,
        errorRate: stats.errorRate,
        uptime: stats.uptime,
      },
      checks: {
        database: dbHealthy,
        memory: memoryHealthy,
        performance: performanceHealthy,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

module.exports = {
  performanceMetrics,
  memoryMonitor,
  healthCheck,
};
