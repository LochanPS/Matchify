const express = require('express');
const router = express.Router();
const { authenticateUser, requireOrganizer, requireAdmin } = require('../middleware/auth');
const { query } = require('../config/database');

// ============ ORGANIZER ANALYTICS ============

// Get organizer dashboard overview
router.get('/organizer/dashboard', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const organizer_id = req.user.uid;

    // Get total tournaments
    const tournamentsResult = await query(
      'SELECT COUNT(*) as total FROM tournaments WHERE organizer_id = $1',
      [organizer_id]
    );
    const total_tournaments = parseInt(tournamentsResult.rows[0].total);

    // Get total participants
    const participantsResult = await query(
      `SELECT COUNT(DISTINCT p.participant_id) as total
       FROM participants p
       JOIN tournaments t ON p.tournament_id = t.tournament_id
       WHERE t.organizer_id = $1`,
      [organizer_id]
    );
    const total_participants = parseInt(participantsResult.rows[0].total);

    // Get total revenue
    const revenueResult = await query(
      `SELECT COALESCE(SUM(entry_fee * (SELECT COUNT(*) FROM participants WHERE tournament_id = t.tournament_id)), 0) as total
       FROM tournaments t
       WHERE t.organizer_id = $1`,
      [organizer_id]
    );
    const total_revenue = parseFloat(revenueResult.rows[0].total);

    // Get average tournament size
    const avgSizeResult = await query(
      `SELECT AVG(participant_count) as avg_size
       FROM (
         SELECT COUNT(*) as participant_count
         FROM participants p
         JOIN tournaments t ON p.tournament_id = t.tournament_id
         WHERE t.organizer_id = $1
         GROUP BY p.tournament_id
       ) subquery`,
      [organizer_id]
    );
    const average_tournament_size = Math.round(parseFloat(avgSizeResult.rows[0].avg_size) || 0);

    // Get completion rate
    const completionResult = await query(
      `SELECT 
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
         COUNT(*) as total
       FROM tournaments
       WHERE organizer_id = $1`,
      [organizer_id]
    );
    const completion_rate = completionResult.rows[0].total > 0
      ? Math.round((parseInt(completionResult.rows[0].completed) / parseInt(completionResult.rows[0].total)) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        total_tournaments,
        total_participants,
        total_revenue,
        average_tournament_size,
        completion_rate,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Error fetching organizer dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Get revenue analytics
router.get('/organizer/revenue', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const organizer_id = req.user.uid;
    const { start_date, end_date, interval = 'day' } = req.query;

    let dateFormat;
    switch (interval) {
      case 'week':
        dateFormat = 'YYYY-IW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const result = await query(
      `SELECT 
         DATE_TRUNC($1, t.tournament_date)::DATE as date,
         COUNT(*) as tournament_count,
         COALESCE(SUM(t.entry_fee * (SELECT COUNT(*) FROM participants WHERE tournament_id = t.tournament_id)), 0) as revenue
       FROM tournaments t
       WHERE t.organizer_id = $2
       AND t.tournament_date >= $3::DATE
       AND t.tournament_date <= $4::DATE
       GROUP BY DATE_TRUNC($1, t.tournament_date)
       ORDER BY date ASC`,
      [interval, organizer_id, start_date || '2025-01-01', end_date || new Date().toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        tournament_count: parseInt(row.tournament_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue data' });
  }
});

// Get tournament formats popularity
router.get('/organizer/formats', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const organizer_id = req.user.uid;

    const result = await query(
      `SELECT 
         format,
         COUNT(*) as count,
         ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
       FROM tournaments
       WHERE organizer_id = $1
       GROUP BY format
       ORDER BY count DESC`,
      [organizer_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching format analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch format data' });
  }
});

// Get recent tournaments with analytics
router.get('/organizer/tournaments', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const organizer_id = req.user.uid;
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT 
         t.tournament_id,
         t.tournament_name,
         t.tournament_date,
         t.status,
         COUNT(DISTINCT p.participant_id) as participant_count,
         COUNT(DISTINCT m.match_id) as match_count,
         COALESCE(AVG(f.rating), 0) as average_rating
       FROM tournaments t
       LEFT JOIN participants p ON t.tournament_id = p.tournament_id
       LEFT JOIN matches m ON t.tournament_id = m.tournament_id
       LEFT JOIN feedback f ON t.tournament_id = f.tournament_id
       WHERE t.organizer_id = $1
       GROUP BY t.tournament_id
       ORDER BY t.tournament_date DESC
       LIMIT $2 OFFSET $3`,
      [organizer_id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        tournament_id: row.tournament_id,
        tournament_name: row.tournament_name,
        tournament_date: row.tournament_date,
        status: row.status,
        participant_count: parseInt(row.participant_count),
        match_count: parseInt(row.match_count),
        average_rating: parseFloat(row.average_rating)
      }))
    });
  } catch (error) {
    console.error('Error fetching tournaments analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tournaments data' });
  }
});

// ============ PLAYER ANALYTICS ============

// Get player dashboard overview
router.get('/player/dashboard', authenticateUser, async (req, res) => {
  try {
    const player_id = req.user.uid;

    // Get total tournaments
    const tournamentsResult = await query(
      'SELECT COUNT(DISTINCT tournament_id) as total FROM participants WHERE player_id = $1',
      [player_id]
    );
    const total_tournaments = parseInt(tournamentsResult.rows[0].total);

    // Get total matches
    const matchesResult = await query(
      `SELECT COUNT(*) as total FROM matches m
       WHERE m.player1_id = $1 OR m.player2_id = $1`,
      [player_id]
    );
    const total_matches = parseInt(matchesResult.rows[0].total);

    // Get matches won
    const winsResult = await query(
      `SELECT COUNT(*) as total FROM matches m
       WHERE (m.player1_id = $1 AND m.winner_id = $1) OR (m.player2_id = $1 AND m.winner_id = $1)`,
      [player_id]
    );
    const matches_won = parseInt(winsResult.rows[0].total);

    // Calculate win rate
    const win_rate = total_matches > 0 ? Math.round((matches_won / total_matches) * 100) : 0;

    // Get current streak
    const streakResult = await query(
      `SELECT COUNT(*) as streak FROM (
         SELECT m.match_id FROM matches m
         WHERE (m.player1_id = $1 AND m.winner_id = $1) OR (m.player2_id = $1 AND m.winner_id = $1)
         ORDER BY m.created_at DESC
         LIMIT 1
       ) recent_wins`,
      [player_id]
    );
    const current_streak = parseInt(streakResult.rows[0].streak);

    res.json({
      success: true,
      data: {
        total_tournaments,
        total_matches,
        matches_won,
        win_rate,
        current_streak
      }
    });
  } catch (error) {
    console.error('Error fetching player dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Get player performance over time
router.get('/player/performance', authenticateUser, async (req, res) => {
  try {
    const player_id = req.user.uid;
    const { start_date, end_date } = req.query;

    const result = await query(
      `SELECT 
         DATE(m.created_at) as date,
         COUNT(*) as matches_played,
         SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) as matches_won,
         ROUND(SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as win_rate
       FROM matches m
       WHERE (m.player1_id = $1 OR m.player2_id = $1)
       AND m.created_at >= $2::DATE
       AND m.created_at <= $3::DATE
       GROUP BY DATE(m.created_at)
       ORDER BY date ASC`,
      [player_id, start_date || '2025-01-01', end_date || new Date().toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        matches_played: parseInt(row.matches_played),
        matches_won: parseInt(row.matches_won),
        win_rate: parseFloat(row.win_rate)
      }))
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch performance data' });
  }
});

// Get recent matches
router.get('/player/matches', authenticateUser, async (req, res) => {
  try {
    const player_id = req.user.uid;
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT 
         m.match_id,
         m.tournament_id,
         t.tournament_name,
         CASE 
           WHEN m.player1_id = $1 THEN u2.name
           ELSE u1.name
         END as opponent_name,
         CASE 
           WHEN m.winner_id = $1 THEN 'Won'
           WHEN m.winner_id IS NULL THEN 'Pending'
           ELSE 'Lost'
         END as result,
         m.created_at
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.tournament_id
       JOIN users u1 ON m.player1_id = u1.user_id
       JOIN users u2 ON m.player2_id = u2.user_id
       WHERE m.player1_id = $1 OR m.player2_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [player_id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
});

// ============ ADMIN ANALYTICS ============

// Get platform dashboard overview
router.get('/admin/dashboard', authenticateUser, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*) as total FROM users');
    const total_users = parseInt(usersResult.rows[0].total);

    // Get total tournaments
    const tournamentsResult = await query('SELECT COUNT(*) as total FROM tournaments');
    const total_tournaments = parseInt(tournamentsResult.rows[0].total);

    // Get total matches
    const matchesResult = await query('SELECT COUNT(*) as total FROM matches');
    const total_matches = parseInt(matchesResult.rows[0].total);

    // Get total revenue
    const revenueResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = \'completed\''
    );
    const total_revenue = parseFloat(revenueResult.rows[0].total);

    res.json({
      success: true,
      data: {
        total_users,
        total_tournaments,
        total_matches,
        total_revenue,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Get user growth analytics
router.get('/admin/growth', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { interval = 'day' } = req.query;

    const result = await query(
      `SELECT 
         DATE_TRUNC($1, created_at)::DATE as date,
         COUNT(*) as new_users,
         COUNT(*) FILTER (WHERE role = 'player') as new_players,
         COUNT(*) FILTER (WHERE role = 'organizer') as new_organizers
       FROM users
       GROUP BY DATE_TRUNC($1, created_at)
       ORDER BY date ASC`,
      [interval]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching growth analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch growth data' });
  }
});

// Get top organizers
router.get('/admin/top-organizers', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
         u.user_id,
         u.name,
         u.city,
         COUNT(DISTINCT t.tournament_id) as tournaments_created,
         COUNT(DISTINCT p.participant_id) as total_participants,
         COALESCE(AVG(f.rating), 0) as average_rating
       FROM users u
       LEFT JOIN tournaments t ON u.user_id = t.organizer_id
       LEFT JOIN participants p ON t.tournament_id = p.tournament_id
       LEFT JOIN feedback f ON t.tournament_id = f.tournament_id
       WHERE u.role = 'organizer'
       GROUP BY u.user_id
       ORDER BY tournaments_created DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching top organizers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch organizers' });
  }
});

// Get top players
router.get('/admin/top-players', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
         u.user_id,
         u.name,
         u.city,
         COUNT(DISTINCT p.tournament_id) as tournaments_played,
         COUNT(DISTINCT m.match_id) as matches_played,
         COUNT(DISTINCT CASE WHEN m.winner_id = u.user_id THEN m.match_id END) as matches_won,
         ROUND(COUNT(DISTINCT CASE WHEN m.winner_id = u.user_id THEN m.match_id END) * 100.0 / 
               NULLIF(COUNT(DISTINCT m.match_id), 0), 2) as win_rate
       FROM users u
       LEFT JOIN participants p ON u.user_id = p.player_id
       LEFT JOIN matches m ON (m.player1_id = u.user_id OR m.player2_id = u.user_id)
       WHERE u.role = 'player'
       GROUP BY u.user_id
       ORDER BY matches_won DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching top players:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

module.exports = router;

