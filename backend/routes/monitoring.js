/**
 * MATCHIFY Monitoring Routes
 * Real-time monitoring dashboard endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { performanceMetrics, memoryMonitor, healthCheck } = require('../config/monitoring');
const db = require('../config/database');

// Middleware to check if user is admin/organizer
const checkAdminAccess = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin access required.'
    });
  }
  next();
};

/**
 * GET /api/monitoring/dashboard
 * Get comprehensive monitoring dashboard data
 */
router.get('/dashboard', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const health = await healthCheck(db);
    const stats = performanceMetrics.getStats();
    const memory = memoryMonitor.getMemoryUsage();

    // Get user metrics
    const userMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'player' THEN 1 ELSE 0 END) as players,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizers,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_users_24h
      FROM users
    `);

    // Get tournament metrics
    const tournamentMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_tournaments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_tournaments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tournaments,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_tournaments_24h
      FROM tournaments
    `);

    // Get payment metrics
    const paymentMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_transactions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as transactions_24h
      FROM payments
    `);

    // Get registration metrics
    const registrationMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_registrations,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_registrations_24h
      FROM participants
    `);

    // Get error metrics
    const errorMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_errors,
        COUNT(DISTINCT error_type) as unique_error_types,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 ELSE 0 END) as errors_last_hour
      FROM error_logs
    `);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth: health,
      performance: {
        apiMetrics: stats.apiMetrics,
        dbMetrics: stats.dbMetrics,
        errorRate: stats.errorRate,
        uptime: stats.uptime
      },
      memory: memory,
      users: userMetrics.rows[0],
      tournaments: tournamentMetrics.rows[0],
      payments: paymentMetrics.rows[0],
      registrations: registrationMetrics.rows[0],
      errors: errorMetrics.rows[0]
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/performance
 * Get detailed performance metrics
 */
router.get('/performance', authenticateUser, checkAdminAccess, (req, res) => {
  try {
    const stats = performanceMetrics.getStats();
    const memory = memoryMonitor.getMemoryUsage();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      performance: {
        api: stats.apiMetrics,
        database: stats.dbMetrics,
        memory: memory,
        errorRate: stats.errorRate,
        uptime: stats.uptime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/health
 * Get system health status
 */
router.get('/health', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const health = await healthCheck(db);
    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health status',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/errors
 * Get error logs and statistics
 */
router.get('/errors', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const errors = await db.query(`
      SELECT 
        id,
        error_type,
        message,
        status_code,
        endpoint,
        user_id,
        created_at
      FROM error_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const errorStats = await db.query(`
      SELECT 
        error_type,
        COUNT(*) as count,
        MAX(created_at) as last_occurred
      FROM error_logs
      GROUP BY error_type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      errors: errors.rows,
      stats: errorStats.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: errors.rows.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error logs',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/users
 * Get user metrics and statistics
 */
router.get('/users', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const userStats = await db.query(`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as new_24h,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_24h
      FROM users
      GROUP BY role
    `);

    const signupTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as signups,
        SUM(CASE WHEN role = 'player' THEN 1 ELSE 0 END) as players,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizers
      FROM users
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      stats: userStats.rows,
      trend: signupTrend.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user metrics',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/tournaments
 * Get tournament metrics and statistics
 */
router.get('/tournaments', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const tournamentStats = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(entry_fee) as avg_entry_fee,
        SUM(entry_fee) as total_fees
      FROM tournaments
      GROUP BY status
    `);

    const tournamentTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tournaments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tournaments
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      stats: tournamentStats.rows,
      trend: tournamentTrend.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament metrics',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/payments
 * Get payment metrics and statistics
 */
router.get('/payments', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const paymentStats = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM payments
      GROUP BY status
    `);

    const paymentTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue
      FROM payments
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      stats: paymentStats.rows,
      trend: paymentTrend.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment metrics',
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/alerts
 * Get active alerts and warnings
 */
router.get('/alerts', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const stats = performanceMetrics.getStats();
    const memory = memoryMonitor.getMemoryUsage();
    const alerts = [];

    // Check for critical conditions
    if (stats.errorRate > 5) {
      alerts.push({
        severity: 'critical',
        message: `High error rate: ${stats.errorRate}%`,
        timestamp: new Date()
      });
    }

    if (stats.apiMetrics.p95 > 1000) {
      alerts.push({
        severity: 'critical',
        message: `Slow API response time: ${stats.apiMetrics.p95}ms (p95)`,
        timestamp: new Date()
      });
    }

    if (parseFloat(memory.heapUsagePercent) > 90) {
      alerts.push({
        severity: 'critical',
        message: `Critical memory usage: ${memory.heapUsagePercent}%`,
        timestamp: new Date()
      });
    }

    // Check for warnings
    if (stats.errorRate > 2) {
      alerts.push({
        severity: 'warning',
        message: `Elevated error rate: ${stats.errorRate}%`,
        timestamp: new Date()
      });
    }

    if (stats.apiMetrics.p95 > 500) {
      alerts.push({
        severity: 'warning',
        message: `Elevated API response time: ${stats.apiMetrics.p95}ms (p95)`,
        timestamp: new Date()
      });
    }

    if (parseFloat(memory.heapUsagePercent) > 80) {
      alerts.push({
        severity: 'warning',
        message: `High memory usage: ${memory.heapUsagePercent}%`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      alerts: alerts,
      alertCount: alerts.length,
      criticalCount: alerts.filter(a => a.severity === 'critical').length,
      warningCount: alerts.filter(a => a.severity === 'warning').length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

module.exports = router;
