// Database query optimization utilities

const { query } = require('../config/database');
const NodeCache = require('node-cache');

// Query result cache with 5-minute default TTL
const queryCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  maxKeys: 1000 // Maximum number of cached queries
});

// Performance monitoring for queries
class QueryPerformanceMonitor {
  constructor() {
    this.slowQueries = [];
    this.queryStats = new Map();
  }
  
  recordQuery(sql, duration, params = []) {
    const queryKey = sql.replace(/\s+/g, ' ').trim().substring(0, 100);
    
    // Track slow queries (>100ms)
    if (duration > 100) {
      this.slowQueries.push({
        sql: queryKey,
        duration,
        params: params.length,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }
    }
    
    // Update query statistics
    const stats = this.queryStats.get(queryKey) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0
    };
    
    stats.count++;
    stats.totalTime += duration;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);
    stats.avgTime = stats.totalTime / stats.count;
    
    this.queryStats.set(queryKey, stats);
  }
  
  getSlowQueries() {
    return this.slowQueries.slice(-20); // Return last 20 slow queries
  }
  
  getQueryStats() {
    const stats = {};
    this.queryStats.forEach((value, key) => {
      stats[key] = value;
    });
    return stats;
  }
  
  getPerformanceSummary() {
    const totalQueries = Array.from(this.queryStats.values())
      .reduce((sum, stat) => sum + stat.count, 0);
    
    const avgResponseTime = Array.from(this.queryStats.values())
      .reduce((sum, stat) => sum + stat.avgTime, 0) / this.queryStats.size;
    
    return {
      totalQueries,
      uniqueQueries: this.queryStats.size,
      avgResponseTime: Math.round(avgResponseTime),
      slowQueries: this.slowQueries.length,
      cacheHitRate: queryCache.getStats()
    };
  }
}

const queryMonitor = new QueryPerformanceMonitor();

// Cached query execution
const cachedQuery = async (sql, params = [], cacheKey = null, ttl = 300) => {
  const key = cacheKey || generateCacheKey(sql, params);
  
  // Check cache first
  const cached = queryCache.get(key);
  if (cached) {
    console.log(`Cache hit for query: ${key.substring(0, 50)}...`);
    return cached;
  }
  
  // Execute query with performance monitoring
  const start = Date.now();
  try {
    const result = await query(sql, params);
    const duration = Date.now() - start;
    
    // Record performance metrics
    queryMonitor.recordQuery(sql, duration, params);
    
    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
    }
    
    // Cache successful results
    queryCache.set(key, result.rows, ttl);
    console.log(`Cache miss - Query executed in ${duration}ms: ${key.substring(0, 50)}...`);
    
    return result.rows;
  } catch (error) {
    const duration = Date.now() - start;
    queryMonitor.recordQuery(sql, duration, params);
    throw error;
  }
};

// Generate cache key from SQL and parameters
const generateCacheKey = (sql, params) => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();
  const paramString = params.length > 0 ? JSON.stringify(params) : '';
  return `${normalizedSql}_${paramString}`.substring(0, 200);
};

// Optimized tournament queries
const optimizedQueries = {
  // Get tournaments with participant counts
  async getTournaments(filters = {}) {
    const { city, status = 'upcoming', limit = 20, offset = 0 } = filters;
    const cacheKey = `tournaments:${city || 'all'}:${status}:${limit}:${offset}`;
    
    let whereClause = 'WHERE t.status = $1';
    const params = [status];
    let paramCount = 1;
    
    if (city) {
      paramCount++;
      whereClause += ` AND t.city = $${paramCount}`;
      params.push(city);
    }
    
    const sql = `
      SELECT 
        t.tournament_id,
        t.name,
        t.venue,
        t.city,
        t.tournament_date,
        t.entry_fee,
        t.max_players,
        t.poster_url,
        t.status,
        COUNT(p.participant_id) as current_participants
      FROM tournaments t
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id 
        AND p.registration_status = 'confirmed'
      ${whereClause}
      GROUP BY t.tournament_id, t.name, t.venue, t.city, t.tournament_date, 
               t.entry_fee, t.max_players, t.poster_url, t.status
      ORDER BY t.tournament_date ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    params.push(limit, offset);
    
    return await cachedQuery(sql, params, cacheKey, 180); // 3 minutes cache
  },
  
  // Get tournament details with categories
  async getTournamentDetails(tournamentId) {
    const cacheKey = `tournament_details:${tournamentId}`;
    
    const sql = `
      SELECT 
        t.*,
        u.name as organizer_name,
        u.organizer_contact,
        COUNT(p.participant_id) as total_participants
      FROM tournaments t
      JOIN users u ON t.organizer_id = u.user_id
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id 
        AND p.registration_status = 'confirmed'
      WHERE t.tournament_id = $1
      GROUP BY t.tournament_id, u.name, u.organizer_contact
    `;
    
    return await cachedQuery(sql, [tournamentId], cacheKey, 300); // 5 minutes cache
  },
  
  // Get player statistics
  async getPlayerStats(playerId) {
    const cacheKey = `player_stats:${playerId}`;
    
    const sql = `
      SELECT 
        u.user_id,
        u.name,
        u.city,
        u.created_at,
        COUNT(m.match_id) as total_matches,
        SUM(CASE WHEN m.winner_id = u.user_id THEN 1 ELSE 0 END) as wins,
        COUNT(m.match_id) - SUM(CASE WHEN m.winner_id = u.user_id THEN 1 ELSE 0 END) as losses,
        CASE 
          WHEN COUNT(m.match_id) > 0 THEN 
            ROUND(SUM(CASE WHEN m.winner_id = u.user_id THEN 1 ELSE 0 END) * 100.0 / COUNT(m.match_id), 2)
          ELSE 0 
        END as win_rate,
        COUNT(DISTINCT t.tournament_id) as tournaments_played
      FROM users u
      LEFT JOIN matches m ON (u.user_id = m.player1_id OR u.user_id = m.player2_id)
        AND m.match_status = 'completed'
      LEFT JOIN tournaments t ON m.tournament_id = t.tournament_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.name, u.city, u.created_at
    `;
    
    return await cachedQuery(sql, [playerId], cacheKey, 300); // 5 minutes cache
  },
  
  // Get recent tournaments for player
  async getPlayerRecentTournaments(playerId, limit = 5) {
    const cacheKey = `player_recent:${playerId}:${limit}`;
    
    const sql = `
      SELECT 
        t.tournament_id,
        t.name,
        t.tournament_date,
        t.venue,
        p.registration_date,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM matches m 
            WHERE m.tournament_id = t.tournament_id 
              AND (m.player1_id = $1 OR m.player2_id = $1)
              AND m.winner_id = $1
          ) THEN 'won'
          WHEN EXISTS (
            SELECT 1 FROM matches m 
            WHERE m.tournament_id = t.tournament_id 
              AND (m.player1_id = $1 OR m.player2_id = $1)
              AND m.match_status = 'completed'
          ) THEN 'participated'
          ELSE 'registered'
        END as result
      FROM tournaments t
      JOIN participants p ON t.tournament_id = p.tournament_id
      WHERE p.player_id = $1 AND p.registration_status = 'confirmed'
      ORDER BY t.tournament_date DESC
      LIMIT $2
    `;
    
    return await cachedQuery(sql, [playerId, limit], cacheKey, 600); // 10 minutes cache
  },
  
  // Get tournament matches with results
  async getTournamentMatches(tournamentId) {
    const cacheKey = `tournament_matches:${tournamentId}`;
    
    const sql = `
      SELECT 
        m.*,
        p1.name as player1_name,
        p2.name as player2_name,
        w.name as winner_name
      FROM matches m
      JOIN users p1 ON m.player1_id = p1.user_id
      JOIN users p2 ON m.player2_id = p2.user_id
      LEFT JOIN users w ON m.winner_id = w.user_id
      WHERE m.tournament_id = $1
      ORDER BY m.round, m.created_at
    `;
    
    return await cachedQuery(sql, [tournamentId], cacheKey, 120); // 2 minutes cache
  }
};

// Cache invalidation utilities
const cacheInvalidation = {
  // Invalidate tournament-related caches
  invalidateTournament(tournamentId) {
    const patterns = [
      `tournaments:`,
      `tournament_details:${tournamentId}`,
      `tournament_matches:${tournamentId}`
    ];
    
    patterns.forEach(pattern => {
      const keys = queryCache.keys().filter(key => key.includes(pattern));
      keys.forEach(key => queryCache.del(key));
    });
    
    console.log(`Invalidated ${patterns.length} tournament cache patterns`);
  },
  
  // Invalidate player-related caches
  invalidatePlayer(playerId) {
    const patterns = [
      `player_stats:${playerId}`,
      `player_recent:${playerId}`
    ];
    
    patterns.forEach(pattern => {
      const keys = queryCache.keys().filter(key => key.includes(pattern));
      keys.forEach(key => queryCache.del(key));
    });
    
    console.log(`Invalidated player cache for ${playerId}`);
  },
  
  // Clear all caches
  clearAll() {
    queryCache.flushAll();
    console.log('All query caches cleared');
  }
};

// Database index recommendations
const indexRecommendations = [
  {
    table: 'tournaments',
    index: 'idx_tournaments_date_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_tournaments_date_status ON tournaments(tournament_date, status);'
  },
  {
    table: 'tournaments',
    index: 'idx_tournaments_city_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_tournaments_city_status ON tournaments(city, status);'
  },
  {
    table: 'participants',
    index: 'idx_participants_tournament_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_participants_tournament_status ON participants(tournament_id, registration_status);'
  },
  {
    table: 'participants',
    index: 'idx_participants_player_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_participants_player_status ON participants(player_id, registration_status);'
  },
  {
    table: 'matches',
    index: 'idx_matches_tournament_round',
    sql: 'CREATE INDEX IF NOT EXISTS idx_matches_tournament_round ON matches(tournament_id, round);'
  },
  {
    table: 'matches',
    index: 'idx_matches_player1_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_matches_player1_status ON matches(player1_id, match_status);'
  },
  {
    table: 'matches',
    index: 'idx_matches_player2_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_matches_player2_status ON matches(player2_id, match_status);'
  },
  {
    table: 'matches',
    index: 'idx_matches_winner',
    sql: 'CREATE INDEX IF NOT EXISTS idx_matches_winner ON matches(winner_id) WHERE winner_id IS NOT NULL;'
  }
];

// Apply recommended indexes
const applyIndexes = async () => {
  console.log('Applying database indexes for performance optimization...');
  
  for (const recommendation of indexRecommendations) {
    try {
      await query(recommendation.sql);
      console.log(`✅ Applied index: ${recommendation.index}`);
    } catch (error) {
      console.error(`❌ Failed to apply index ${recommendation.index}:`, error.message);
    }
  }
  
  console.log('Database index optimization complete');
};

module.exports = {
  cachedQuery,
  optimizedQueries,
  cacheInvalidation,
  queryMonitor,
  applyIndexes,
  indexRecommendations
};