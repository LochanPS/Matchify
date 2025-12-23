/**
 * MATCHIFY Advanced Analytics Routes
 * Detailed analytics with custom date ranges and comparisons
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
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
 * GET /api/analytics/advanced/users
 * Get detailed user analytics with date range
 */
router.get('/advanced/users', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // User signup trends
    const signupTrends = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_signups,
        SUM(CASE WHEN role = 'player' THEN 1 ELSE 0 END) as player_signups,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizer_signups
      FROM users
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [start, end]);

    // User retention
    const retention = await db.query(`
      SELECT 
        DATE(created_at) as signup_date,
        COUNT(*) as total_users,
        SUM(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as active_7d,
        SUM(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as active_30d
      FROM users
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY signup_date DESC
    `, [start, end]);

    // User segmentation
    const segmentation = await db.query(`
      SELECT 
        role,
        city,
        COUNT(*) as user_count,
        AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400) as avg_days_active
      FROM users
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY role, city
      ORDER BY user_count DESC
    `, [start, end]);

    res.json({
      success: true,
      period: { start, end },
      signupTrends: signupTrends.rows,
      retention: retention.rows,
      segmentation: segmentation.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/advanced/tournaments
 * Get detailed tournament analytics with date range
 */
router.get('/advanced/tournaments', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Tournament creation trends
    const creationTrends = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tournaments_created,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tournaments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [start, end]);

    // Tournament performance
    const performance = await db.query(`
      SELECT 
        t.id,
        t.name,
        t.status,
        COUNT(DISTINCT p.id) as participant_count,
        AVG(t.entry_fee) as avg_entry_fee,
        SUM(t.entry_fee) as total_fees
      FROM tournaments t
      LEFT JOIN participants p ON t.id = p.tournament_id
      WHERE t.created_at BETWEEN $1 AND $2
      GROUP BY t.id, t.name, t.status
      ORDER BY participant_count DESC
      LIMIT 20
    `, [start, end]);

    // Tournament format analysis
    const formats = await db.query(`
      SELECT 
        format,
        COUNT(*) as count,
        AVG(entry_fee) as avg_fee,
        SUM(entry_fee) as total_fees
      FROM tournaments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY format
      ORDER BY count DESC
    `, [start, end]);

    res.json({
      success: true,
      period: { start, end },
      creationTrends: creationTrends.rows,
      performance: performance.rows,
      formats: formats.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/advanced/payments
 * Get detailed payment analytics with date range
 */
router.get('/advanced/payments', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Revenue trends
    const revenueTrends = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_transaction
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [start, end]);

    // Payment success rate
    const successRate = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM payments WHERE created_at BETWEEN $1 AND $2), 2) as percentage
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY status
    `, [start, end]);

    // Revenue by city
    const revenueByCity = await db.query(`
      SELECT 
        u.city,
        COUNT(p.id) as transactions,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as revenue
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY u.city
      ORDER BY revenue DESC
    `, [start, end]);

    res.json({
      success: true,
      period: { start, end },
      revenueTrends: revenueTrends.rows,
      successRate: successRate.rows,
      revenueByCity: revenueByCity.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/advanced/engagement
 * Get detailed engagement analytics
 */
router.get('/advanced/engagement', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Match participation
    const matchParticipation = await db.query(`
      SELECT 
        DATE(m.created_at) as date,
        COUNT(DISTINCT m.id) as matches,
        COUNT(DISTINCT m.player1_id) + COUNT(DISTINCT m.player2_id) as total_participants,
        COUNT(DISTINCT CASE WHEN m.winner_id IS NOT NULL THEN m.id END) as completed_matches
      FROM matches m
      WHERE m.created_at BETWEEN $1 AND $2
      GROUP BY DATE(m.created_at)
      ORDER BY date DESC
    `, [start, end]);

    // Profile completion
    const profileCompletion = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) as with_bio,
        SUM(CASE WHEN profile_picture_url IS NOT NULL THEN 1 ELSE 0 END) as with_picture,
        SUM(CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END) as with_city,
        ROUND(100.0 * SUM(CASE WHEN bio IS NOT NULL AND profile_picture_url IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
      FROM users
      WHERE created_at BETWEEN $1 AND $2
    `, [start, end]);

    // Community engagement
    const communityEngagement = await db.query(`
      SELECT 
        'forum_posts' as type,
        COUNT(*) as count
      FROM community_forums
      WHERE created_at BETWEEN $1 AND $2
      UNION ALL
      SELECT 
        'group_members' as type,
        COUNT(*) as count
      FROM community_groups
      WHERE created_at BETWEEN $1 AND $2
      UNION ALL
      SELECT 
        'events' as type,
        COUNT(*) as count
      FROM community_events
      WHERE created_at BETWEEN $1 AND $2
    `, [start, end]);

    res.json({
      success: true,
      period: { start, end },
      matchParticipation: matchParticipation.rows,
      profileCompletion: profileCompletion.rows,
      communityEngagement: communityEngagement.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/advanced/comparison
 * Compare metrics between two date ranges
 */
router.get('/advanced/comparison', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { startDate1, endDate1, startDate2, endDate2 } = req.query;
    
    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
      return res.status(400).json({
        success: false,
        message: 'All date parameters required: startDate1, endDate1, startDate2, endDate2'
      });
    }

    const s1 = new Date(startDate1);
    const e1 = new Date(endDate1);
    const s2 = new Date(startDate2);
    const e2 = new Date(endDate2);

    // Period 1 metrics
    const period1 = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2) as signups,
        (SELECT COUNT(*) FROM tournaments WHERE created_at BETWEEN $1 AND $2) as tournaments,
        (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at BETWEEN $1 AND $2) as revenue,
        (SELECT COUNT(*) FROM participants WHERE created_at BETWEEN $1 AND $2) as registrations
    `, [s1, e1]);

    // Period 2 metrics
    const period2 = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2) as signups,
        (SELECT COUNT(*) FROM tournaments WHERE created_at BETWEEN $1 AND $2) as tournaments,
        (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at BETWEEN $1 AND $2) as revenue,
        (SELECT COUNT(*) FROM participants WHERE created_at BETWEEN $1 AND $2) as registrations
    `, [s2, e2]);

    const p1 = period1.rows[0];
    const p2 = period2.rows[0];

    // Calculate changes
    const comparison = {
      signups: {
        period1: p1.signups,
        period2: p2.signups,
        change: p2.signups - p1.signups,
        changePercent: p1.signups > 0 ? ((p2.signups - p1.signups) / p1.signups * 100).toFixed(2) : 0
      },
      tournaments: {
        period1: p1.tournaments,
        period2: p2.tournaments,
        change: p2.tournaments - p1.tournaments,
        changePercent: p1.tournaments > 0 ? ((p2.tournaments - p1.tournaments) / p1.tournaments * 100).toFixed(2) : 0
      },
      revenue: {
        period1: p1.revenue || 0,
        period2: p2.revenue || 0,
        change: (p2.revenue || 0) - (p1.revenue || 0),
        changePercent: p1.revenue > 0 ? (((p2.revenue || 0) - (p1.revenue || 0)) / p1.revenue * 100).toFixed(2) : 0
      },
      registrations: {
        period1: p1.registrations,
        period2: p2.registrations,
        change: p2.registrations - p1.registrations,
        changePercent: p1.registrations > 0 ? ((p2.registrations - p1.registrations) / p1.registrations * 100).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      period1: { start: s1, end: e1 },
      period2: { start: s2, end: e2 },
      comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comparison analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/advanced/export
 * Export analytics data to CSV
 */
router.get('/advanced/export', authenticateUser, checkAdminAccess, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let data = [];
    let filename = '';

    if (type === 'users') {
      const result = await db.query(`
        SELECT 
          id, name, email, role, city, created_at, last_login
        FROM users
        WHERE created_at BETWEEN $1 AND $2
        ORDER BY created_at DESC
      `, [start, end]);
      data = result.rows;
      filename = 'users-export.csv';
    } else if (type === 'tournaments') {
      const result = await db.query(`
        SELECT 
          id, name, status, format, entry_fee, created_at, organizer_id
        FROM tournaments
        WHERE created_at BETWEEN $1 AND $2
        ORDER BY created_at DESC
      `, [start, end]);
      data = result.rows;
      filename = 'tournaments-export.csv';
    } else if (type === 'payments') {
      const result = await db.query(`
        SELECT 
          id, user_id, tournament_id, amount, status, created_at
        FROM payments
        WHERE created_at BETWEEN $1 AND $2
        ORDER BY created_at DESC
      `, [start, end]);
      data = result.rows;
      filename = 'payments-export.csv';
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for export'
      });
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

module.exports = router;
