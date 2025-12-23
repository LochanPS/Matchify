// Day 60: Player Metrics API
// Replaces skill_level with objective metrics
// Philosophy: Show the journey, not the category

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /player-metrics/:userId - Get comprehensive player metrics
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get player metrics from view
    const metricsQuery = `
      SELECT 
        id,
        name,
        email,
        city,
        matches_played,
        wins,
        win_rate,
        account_age_days,
        account_age_months,
        matches_last_30_days,
        last_match_date,
        created_at
      FROM player_metrics
      WHERE id = $1
    `;

    const metricsResult = await db.query(metricsQuery, [userId]);

    if (metricsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const playerMetrics = metricsResult.rows[0];

    // Get win streak
    const streakQuery = `
      SELECT * FROM get_win_streak($1)
    `;

    const streakResult = await db.query(streakQuery, [userId]);
    const streak = streakResult.rows[0] || { streak_type: null, streak_count: 0 };

    // Format response
    const response = {
      id: playerMetrics.id,
      name: playerMetrics.name,
      email: playerMetrics.email,
      city: playerMetrics.city,
      
      // Experience Metrics
      experience: {
        matchesPlayed: playerMetrics.matches_played,
        accountAgeDays: playerMetrics.account_age_days,
        accountAgeMonths: playerMetrics.account_age_months,
        joinedDate: playerMetrics.created_at,
      },

      // Performance Metrics
      performance: {
        wins: playerMetrics.wins,
        losses: playerMetrics.matches_played - playerMetrics.wins,
        winRate: playerMetrics.win_rate,
      },

      // Activity Metrics
      activity: {
        matchesLast30Days: playerMetrics.matches_last_30_days,
        lastMatchDate: playerMetrics.last_match_date,
      },

      // Current Form
      currentStreak: {
        type: streak.streak_type, // 'win' or 'loss'
        count: streak.streak_count,
      },

      // Summary (for quick display)
      summary: {
        displayName: playerMetrics.name,
        location: playerMetrics.city,
        primaryStat: `${playerMetrics.matches_played} matches`,
        secondaryStat: `${playerMetrics.win_rate}% win rate`,
        tertiaryInfo: `Active for ${playerMetrics.account_age_months} months`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching player metrics:', error);
    res.status(500).json({ message: 'Error fetching player metrics' });
  }
});

// GET /player-metrics/:userId/comparison - Compare two players
router.get('/:userId/comparison', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { opponentId } = req.query;

    if (!opponentId) {
      return res.status(400).json({ message: 'opponentId query parameter required' });
    }

    // Get both players' metrics
    const metricsQuery = `
      SELECT 
        id,
        name,
        matches_played,
        wins,
        win_rate,
        account_age_months,
        matches_last_30_days
      FROM player_metrics
      WHERE id IN ($1, $2)
    `;

    const result = await db.query(metricsQuery, [userId, opponentId]);

    if (result.rows.length < 2) {
      return res.status(404).json({ message: 'One or both players not found' });
    }

    const player1 = result.rows.find(p => p.id === userId);
    const player2 = result.rows.find(p => p.id === opponentId);

    // Calculate comparison
    const comparison = {
      player1: {
        id: player1.id,
        name: player1.name,
        stats: {
          matchesPlayed: player1.matches_played,
          wins: player1.wins,
          winRate: player1.win_rate,
          accountAgeMonths: player1.account_age_months,
          recentActivity: player1.matches_last_30_days,
        },
      },
      player2: {
        id: player2.id,
        name: player2.name,
        stats: {
          matchesPlayed: player2.matches_played,
          wins: player2.wins,
          winRate: player2.win_rate,
          accountAgeMonths: player2.account_age_months,
          recentActivity: player2.matches_last_30_days,
        },
      },
      comparison: {
        experienceDifference: player2.matches_played - player1.matches_played,
        winRateDifference: player2.win_rate - player1.win_rate,
        tenureDifference: player2.account_age_months - player1.account_age_months,
        insights: generateComparisonInsights(player1, player2),
      },
    };

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing players:', error);
    res.status(500).json({ message: 'Error comparing players' });
  }
});

// GET /player-metrics/leaderboard - Get leaderboard based on metrics
router.get('/leaderboard/top', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, sortBy = 'win_rate' } = req.query;

    // Validate sortBy parameter
    const validSortFields = ['win_rate', 'matches_played', 'wins'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'win_rate';

    const leaderboardQuery = `
      SELECT 
        id,
        name,
        city,
        matches_played,
        wins,
        win_rate,
        account_age_months
      FROM player_metrics
      WHERE matches_played >= 5
      ORDER BY ${sortField} DESC
      LIMIT $1
    `;

    const result = await db.query(leaderboardQuery, [Math.min(limit, 100)]);

    const leaderboard = result.rows.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      name: player.name,
      city: player.city,
      matchesPlayed: player.matches_played,
      wins: player.wins,
      winRate: player.win_rate,
      accountAgeMonths: player.account_age_months,
    }));

    res.json({
      sortedBy: sortField,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Helper function to generate comparison insights
function generateComparisonInsights(player1, player2) {
  const insights = [];

  // Experience comparison
  if (player2.matches_played > player1.matches_played) {
    const diff = player2.matches_played - player1.matches_played;
    insights.push(`${player2.name} has ${diff} more matches of experience`);
  } else if (player1.matches_played > player2.matches_played) {
    const diff = player1.matches_played - player2.matches_played;
    insights.push(`${player1.name} has ${diff} more matches of experience`);
  }

  // Win rate comparison
  if (player2.win_rate > player1.win_rate) {
    const diff = (player2.win_rate - player1.win_rate).toFixed(1);
    insights.push(`${player2.name} has a ${diff}% higher win rate`);
  } else if (player1.win_rate > player2.win_rate) {
    const diff = (player1.win_rate - player2.win_rate).toFixed(1);
    insights.push(`${player1.name} has a ${diff}% higher win rate`);
  }

  // Tenure comparison
  if (player2.account_age_months > player1.account_age_months) {
    insights.push(`${player2.name} has been on the platform longer`);
  } else if (player1.account_age_months > player2.account_age_months) {
    insights.push(`${player1.name} has been on the platform longer`);
  }

  return insights;
}

module.exports = router;
