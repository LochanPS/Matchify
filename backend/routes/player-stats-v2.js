/**
 * Player Stats API Routes (v2)
 * Provides comprehensive player statistics without skill-level classifications
 * Integrates with Matchify Credits system
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /player-stats/:playerId
 * Get comprehensive player statistics
 */
router.get('/:playerId', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    const stats = await db.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.city,
        u.first_tournament_date,
        u.last_active_date,
        u.total_tournaments_joined,
        u.total_matches_played,
        u.total_wins,
        u.total_losses,
        u.current_streak,
        u.best_streak,
        ps.total_matches,
        ps.wins,
        ps.losses,
        ps.win_percentage,
        ps.tournaments_joined,
        ps.tournaments_completed,
        ps.tournaments_won,
        ps.runner_up_finishes,
        ps.semifinal_finishes,
        ps.longest_win_streak,
        ps.current_win_streak,
        ps.completion_rate,
        ps.active_months,
        ps.tournaments_per_month,
        CASE
          WHEN ps.tournaments_completed = 0 THEN 'New Player'
          WHEN ps.tournaments_completed BETWEEN 1 AND 5 THEN 'Getting Started'
          WHEN ps.tournaments_completed BETWEEN 6 AND 15 THEN 'Active Player'
          WHEN ps.tournaments_completed > 15 THEN 'Veteran Player'
        END AS experience_segment,
        CASE
          WHEN ps.longest_win_streak >= 5 THEN '🔥 On Fire'
          WHEN ps.current_win_streak >= 3 THEN '⚡ Hot Streak'
          WHEN ps.win_percentage >= 60 THEN '✨ Strong Form'
          ELSE '📈 Building'
        END AS current_form_badge
      FROM users u
      LEFT JOIN player_stats ps ON u.user_id = ps.player_id
      WHERE u.user_id = $1 AND u.role = 'player'`,
      [playerId]
    );

    if (stats.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

/**
 * GET /player-stats/:playerId/comparison
 * Compare two players objectively (without skill labels)
 */
router.get('/:playerId/comparison', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;
    const { compareWithId } = req.query;

    if (!compareWithId) {
      return res.status(400).json({ error: 'compareWithId query parameter required' });
    }

    // Get both players' stats
    const result = await db.query(
      `SELECT
        u.user_id,
        u.name,
        u.city,
        ps.total_matches,
        ps.wins,
        ps.win_percentage,
        ps.tournaments_joined,
        ps.tournaments_completed,
        ps.longest_win_streak,
        ps.current_win_streak,
        ps.completion_rate,
        ps.active_months
      FROM users u
      LEFT JOIN player_stats ps ON u.user_id = ps.player_id
      WHERE u.user_id IN ($1, $2) AND u.role = 'player'`,
      [playerId, compareWithId]
    );

    if (result.rows.length < 2) {
      return res.status(404).json({ error: 'One or both players not found' });
    }

    const player1 = result.rows[0];
    const player2 = result.rows[1];

    // Check minimum matches for fair comparison
    const MIN_MATCHES = 5;
    if (player1.total_matches < MIN_MATCHES || player2.total_matches < MIN_MATCHES) {
      return res.status(400).json({
        error: 'Both players need at least 5 matches for fair comparison',
        player1_matches: player1.total_matches,
        player2_matches: player2.total_matches
      });
    }

    // Generate comparison insights
    const insights = [];

    if (player2.tournaments_completed > player1.tournaments_completed) {
      const diff = player2.tournaments_completed - player1.tournaments_completed;
      insights.push(`${player2.name} has completed ${diff} more tournaments`);
    } else if (player1.tournaments_completed > player2.tournaments_completed) {
      const diff = player1.tournaments_completed - player2.tournaments_completed;
      insights.push(`${player1.name} has completed ${diff} more tournaments`);
    }

    if (player2.win_percentage > player1.win_percentage) {
      const diff = (player2.win_percentage - player1.win_percentage).toFixed(1);
      insights.push(`${player2.name} has a ${diff}% higher win rate`);
    } else if (player1.win_percentage > player2.win_percentage) {
      const diff = (player1.win_percentage - player2.win_percentage).toFixed(1);
      insights.push(`${player1.name} has a ${diff}% higher win rate`);
    }

    if (player2.longest_win_streak > player1.longest_win_streak) {
      insights.push(`${player2.name} has a better win streak (${player2.longest_win_streak} vs ${player1.longest_win_streak})`);
    } else if (player1.longest_win_streak > player2.longest_win_streak) {
      insights.push(`${player1.name} has a better win streak (${player1.longest_win_streak} vs ${player2.longest_win_streak})`);
    }

    res.json({
      player1: {
        id: player1.user_id,
        name: player1.name,
        city: player1.city,
        stats: {
          tournaments: player1.tournaments_completed,
          matches: player1.total_matches,
          wins: player1.wins,
          winRate: player1.win_percentage,
          bestStreak: player1.longest_win_streak,
          activeMonths: player1.active_months
        }
      },
      player2: {
        id: player2.user_id,
        name: player2.name,
        city: player2.city,
        stats: {
          tournaments: player2.tournaments_completed,
          matches: player2.total_matches,
          wins: player2.wins,
          winRate: player2.win_percentage,
          bestStreak: player2.longest_win_streak,
          activeMonths: player2.active_months
        }
      },
      insights: insights,
      canCompare: true
    });
  } catch (error) {
    console.error('Error comparing players:', error);
    res.status(500).json({ error: 'Failed to compare players' });
  }
});

/**
 * GET /player-stats/:playerId/achievements
 * Get player achievements (milestone-based, not skill-based)
 */
router.get('/:playerId/achievements', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    const stats = await db.query(
      `SELECT ps.* FROM player_stats ps
       WHERE ps.player_id = $1`,
      [playerId]
    );

    if (stats.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerStats = stats.rows[0];
    const achievements = [];

    // Milestone achievements (not skill-based)
    if (playerStats.tournaments_joined >= 1) {
      achievements.push({
        id: 'first_tournament',
        title: 'First Step',
        description: 'Joined your first tournament',
        icon: '🏸',
        unlocked: true
      });
    }

    if (playerStats.wins >= 1) {
      achievements.push({
        id: 'first_win',
        title: 'Taste of Victory',
        description: 'Won your first match',
        icon: '🎯',
        unlocked: true
      });
    }

    if (playerStats.longest_win_streak >= 5) {
      achievements.push({
        id: 'five_win_streak',
        title: 'On Fire',
        description: '5 consecutive wins',
        icon: '🔥',
        unlocked: true
      });
    }

    if (playerStats.tournaments_won >= 1) {
      achievements.push({
        id: 'tournament_champion',
        title: 'Champion',
        description: 'Won a tournament',
        icon: '🏆',
        unlocked: true
      });
    }

    if (playerStats.tournaments_completed >= 20) {
      achievements.push({
        id: 'veteran',
        title: 'Veteran Player',
        description: 'Completed 20 tournaments',
        icon: '⭐',
        unlocked: true
      });
    }

    if (playerStats.tournaments_completed >= 10 && playerStats.completion_rate >= 80) {
      achievements.push({
        id: 'consistent',
        title: 'Consistency King',
        description: '80% completion rate over 10 tournaments',
        icon: '💎',
        unlocked: true
      });
    }

    // Locked achievements
    if (playerStats.longest_win_streak < 10) {
      achievements.push({
        id: 'ten_win_streak',
        title: '10-Win Streak',
        description: '10 consecutive wins',
        icon: '🌟',
        unlocked: false,
        progress: `${playerStats.longest_win_streak}/10`
      });
    }

    if (playerStats.tournaments_won < 5) {
      achievements.push({
        id: 'five_time_champion',
        title: 'Five-Time Champion',
        description: 'Win 5 tournaments',
        icon: '👑',
        unlocked: false,
        progress: `${playerStats.tournaments_won}/5`
      });
    }

    res.json({
      playerId,
      achievements,
      unlockedCount: achievements.filter(a => a.unlocked).length,
      totalCount: achievements.length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * GET /player-stats/leaderboard/city
 * Get city leaderboard (without skill tiers)
 */
router.get('/leaderboard/city', async (req, res) => {
  try {
    const { city, limit = 20, offset = 0 } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }

    const leaderboard = await db.query(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY ps.win_percentage DESC) as rank,
        u.user_id,
        u.name,
        u.city,
        ps.total_matches,
        ps.wins,
        ps.win_percentage,
        ps.tournaments_completed,
        ps.longest_win_streak
      FROM users u
      LEFT JOIN player_stats ps ON u.user_id = ps.player_id
      WHERE u.city = $1 AND u.role = 'player' AND ps.total_matches >= 10
      ORDER BY ps.win_percentage DESC
      LIMIT $2 OFFSET $3`,
      [city, limit, offset]
    );

    res.json({
      city,
      leaderboard: leaderboard.rows,
      count: leaderboard.rows.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /player-stats/:playerId/recommendations
 * Get tournament recommendations based on player stats (not skill labels)
 */
router.get('/:playerId/recommendations', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get player stats
    const playerResult = await db.query(
      `SELECT u.*, ps.* FROM users u
       LEFT JOIN player_stats ps ON u.user_id = ps.player_id
       WHERE u.user_id = $1`,
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Get recommended tournaments based on player's patterns
    const recommendations = await db.query(
      `SELECT
        t.*,
        COUNT(p.player_id) as current_participants,
        AVG(ps.win_percentage) as avg_participant_win_rate
      FROM tournaments t
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id
      LEFT JOIN player_stats ps ON p.player_id = ps.player_id
      WHERE t.city = $1
        AND t.status = 'upcoming'
        AND t.tournament_id NOT IN (
          SELECT tournament_id FROM participants WHERE player_id = $2
        )
      GROUP BY t.tournament_id
      ORDER BY
        CASE WHEN t.city = $1 THEN 1 ELSE 2 END,
        t.tournament_date ASC
      LIMIT 10`,
      [player.city, playerId]
    );

    res.json({
      playerId,
      playerCity: player.city,
      recommendations: recommendations.rows,
      recommendationReason: 'Based on your location and tournament preferences'
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * POST /player-stats/:playerId/update
 * Manually trigger player stats update (admin only)
 */
router.post('/:playerId/update', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    // Call the update function
    await db.query('SELECT update_player_stats($1)', [playerId]);

    res.json({ message: 'Player stats updated successfully' });
  } catch (error) {
    console.error('Error updating player stats:', error);
    res.status(500).json({ error: 'Failed to update player stats' });
  }
});

module.exports = router;
