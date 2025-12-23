const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const pool = require('../config/database');

/**
 * POST /matches/:id/score
 * Submit score for a match (Organizer only)
 */
exports.submitScore = async (req, res) => {
  try {
    const { id: matchId } = req.params;
    const { player1_score, player2_score } = req.body;
    const userId = req.user.user_id;

    // Validate scores
    if (player1_score === undefined || player2_score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Both player scores are required'
      });
    }

    // Validate score format (must be non-negative integers)
    if (!Number.isInteger(player1_score) || !Number.isInteger(player2_score) ||
        player1_score < 0 || player2_score < 0) {
      return res.status(400).json({
        success: false,
        message: 'Scores must be non-negative integers'
      });
    }

    // Validate there's a winner (no ties)
    if (player1_score === player2_score) {
      return res.status(400).json({
        success: false,
        message: 'Scores cannot be tied. There must be a winner'
      });
    }

    // Get match details
    const match = await Match.findByIdWithDetails(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if match has both players assigned
    if (!match.player1_id || !match.player2_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit score for match without both players assigned'
      });
    }

    // Check if match is already completed
    if (match.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Match is already completed'
      });
    }

    // Get tournament to verify organizer
    const tournament = await Tournament.findById(match.tournament_id);

    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can submit scores'
      });
    }

    // Check if user is the tournament organizer
    if (tournament.organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit scores for your own tournaments'
      });
    }

    // Determine winner
    const winnerId = player1_score > player2_score ? match.player1_id : match.player2_id;
    const loserId = player1_score > player2_score ? match.player2_id : match.player1_id;

    // Use transaction to update match, player stats, and advance winner
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update match with scores and winner
      const updateMatchQuery = `
        UPDATE matches
        SET 
          player1_score = $1,
          player2_score = $2,
          winner_id = $3,
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE match_id = $4
        RETURNING *
      `;

      const matchResult = await client.query(updateMatchQuery, [
        player1_score,
        player2_score,
        winnerId,
        matchId
      ]);

      // Update winner's stats
      const updateWinnerQuery = `
        UPDATE users
        SET 
          matches_played = matches_played + 1,
          matches_won = matches_won + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      await client.query(updateWinnerQuery, [winnerId]);

      // Update loser's stats
      const updateLoserQuery = `
        UPDATE users
        SET 
          matches_played = matches_played + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      await client.query(updateLoserQuery, [loserId]);

      // If knockout format, advance winner to next round
      if (tournament.format === 'knockout') {
        await advanceWinnerInKnockout(client, match, winnerId, tournament.tournament_id);
      }

      // Check if tournament is complete
      const isComplete = await checkTournamentComplete(client, tournament.tournament_id, tournament.format);

      if (isComplete) {
        // Update tournament status to completed
        await client.query(
          `UPDATE tournaments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE tournament_id = $1`,
          [tournament.tournament_id]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Score submitted successfully',
        match: matchResult.rows[0],
        winner_id: winnerId,
        tournament_complete: isComplete
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit score',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments/:id/leaderboard
 * Get tournament leaderboard (for league format)
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;

    // Get tournament
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Only league format has leaderboard
    if (tournament.format !== 'league') {
      return res.status(400).json({
        success: false,
        message: 'Leaderboard is only available for league format tournaments'
      });
    }

    // Get leaderboard
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.matches_played as total_matches_played,
        u.wins as total_wins,
        u.losses as total_losses,
        COUNT(m.match_id) as tournament_matches_played,
        SUM(CASE WHEN m.winner_id = u.user_id THEN 1 ELSE 0 END) as tournament_wins,
        SUM(CASE WHEN m.winner_id != u.user_id AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as tournament_losses,
        SUM(CASE WHEN m.winner_id = u.user_id THEN 3 ELSE 0 END) as points,
        SUM(CASE WHEN m.player1_id = u.user_id THEN m.player1_score ELSE m.player2_score END) as total_score,
        -- Experience level based on objective data
        CASE 
          WHEN u.matches_played = 0 THEN 'New to tournaments'
          WHEN u.matches_played < 5 THEN 'Getting started'
          WHEN u.matches_played < 20 THEN 'Active player'
          WHEN u.matches_played < 50 THEN 'Tournament regular'
          ELSE 'Veteran player'
        END as experience_level
      FROM participants p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN matches m ON (m.player1_id = u.user_id OR m.player2_id = u.user_id) 
        AND m.tournament_id = p.tournament_id
        AND m.status = 'completed'
      WHERE p.tournament_id = $1
      GROUP BY u.user_id, u.full_name, u.matches_played, u.wins, u.losses
      ORDER BY points DESC, tournament_wins DESC, total_score DESC
    `;

    const result = await pool.query(query, [tournamentId]);

    res.json({
      success: true,
      tournament: {
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        format: tournament.format,
        status: tournament.status
      },
      leaderboard: result.rows.map((row, index) => ({
        rank: index + 1,
        user_id: row.user_id,
        full_name: row.full_name,
        experience_level: row.experience_level,
        total_matches_played: parseInt(row.total_matches_played),
        total_wins: parseInt(row.total_wins),
        total_losses: parseInt(row.total_losses),
        tournament_matches_played: parseInt(row.tournament_matches_played),
        tournament_wins: parseInt(row.tournament_wins),
        tournament_losses: parseInt(row.tournament_losses),
        points: parseInt(row.points),
        total_score: parseInt(row.total_score)
      }))
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper: Advance winner to next round in knockout tournament
 */
async function advanceWinnerInKnockout(client, completedMatch, winnerId, tournamentId) {
  // Find the next round match where this winner should advance
  const nextRoundNumber = completedMatch.round_number + 1;

  // Get all matches in next round
  const nextRoundQuery = `
    SELECT * FROM matches
    WHERE tournament_id = $1 AND round_number = $2
    ORDER BY match_number ASC
  `;

  const nextRoundResult = await client.query(nextRoundQuery, [tournamentId, nextRoundNumber]);

  if (nextRoundResult.rows.length === 0) {
    // This was the final match
    return;
  }

  // Determine which match in next round this winner advances to
  // Match number in current round determines position in next round
  const nextMatchIndex = Math.floor((completedMatch.match_number - 1) / 2);
  const nextMatch = nextRoundResult.rows[nextMatchIndex];

  // Determine if winner goes to player1 or player2 slot
  const isPlayer1Slot = (completedMatch.match_number - 1) % 2 === 0;

  const updateQuery = isPlayer1Slot
    ? `UPDATE matches SET player1_id = $1 WHERE match_id = $2`
    : `UPDATE matches SET player2_id = $1 WHERE match_id = $2`;

  await client.query(updateQuery, [winnerId, nextMatch.match_id]);
}

/**
 * Helper: Check if tournament is complete
 */
async function checkTournamentComplete(client, tournamentId, format) {
  if (format === 'knockout') {
    // Check if final match is completed
    const query = `
      SELECT COUNT(*) as incomplete
      FROM matches
      WHERE tournament_id = $1 
        AND status != 'completed'
        AND player1_id IS NOT NULL 
        AND player2_id IS NOT NULL
    `;

    const result = await client.query(query, [tournamentId]);
    return parseInt(result.rows[0].incomplete) === 0;
  }

  if (format === 'league') {
    // Check if all matches are completed
    const query = `
      SELECT COUNT(*) as incomplete
      FROM matches
      WHERE tournament_id = $1 AND status != 'completed'
    `;

    const result = await client.query(query, [tournamentId]);
    return parseInt(result.rows[0].incomplete) === 0;
  }

  return false;
}
