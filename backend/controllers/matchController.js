const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Participant = require('../models/Participant');
const pool = require('../config/database');
const {
  generateKnockoutBracket,
  generateLeagueMatches,
  validateParticipantCount,
  calculateTotalMatches,
  getRoundName
} = require('../utils/matchGenerator');

/**
 * POST /tournaments/:id/generate-matches
 * Generate matches for a tournament (Organizer only)
 */
exports.generateMatches = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user.user_id;

    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can generate matches'
      });
    }

    // Get tournament details
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if user is the tournament organizer
    if (tournament.organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only generate matches for your own tournaments'
      });
    }

    // Check if tournament is upcoming
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Matches can only be generated for upcoming tournaments'
      });
    }

    // Get all participants
    const participants = await Participant.findByTournament(tournamentId);
    const participantIds = participants.map(p => p.user_id);
    const participantCount = participantIds.length;

    // Validate participant count
    const validation = validateParticipantCount(participantCount, tournament.format);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check if matches already exist
    const existingMatches = await Match.findByTournament(tournamentId);
    if (existingMatches.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Matches have already been generated for this tournament'
      });
    }

    // Generate matches based on format
    let matchesToCreate;
    if (tournament.format === 'knockout') {
      matchesToCreate = generateKnockoutBracket(participantIds, tournamentId);
    } else if (tournament.format === 'league') {
      matchesToCreate = generateLeagueMatches(participantIds, tournamentId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid tournament format'
      });
    }

    // Use transaction to create all matches and update tournament status
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create all matches
      const createdMatches = [];
      for (const matchData of matchesToCreate) {
        const query = `
          INSERT INTO matches (
            tournament_id,
            round_number,
            match_number,
            player1_id,
            player2_id,
            scheduled_time
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        
        const result = await client.query(query, [
          matchData.tournament_id,
          matchData.round_number,
          matchData.match_number,
          matchData.player1_id,
          matchData.player2_id,
          matchData.scheduled_time
        ]);
        
        createdMatches.push(result.rows[0]);
      }

      // Update tournament status to 'live'
      const updateQuery = `
        UPDATE tournaments
        SET status = 'live', updated_at = CURRENT_TIMESTAMP
        WHERE tournament_id = $1
        RETURNING *
      `;
      
      const tournamentResult = await client.query(updateQuery, [tournamentId]);

      await client.query('COMMIT');

      // Calculate statistics
      const totalMatches = calculateTotalMatches(participantCount, tournament.format);
      const rounds = tournament.format === 'knockout' 
        ? Math.log2(participantCount) 
        : 1;

      res.status(201).json({
        success: true,
        message: 'Matches generated successfully',
        tournament: tournamentResult.rows[0],
        statistics: {
          total_participants: participantCount,
          total_matches: totalMatches,
          total_rounds: rounds,
          format: tournament.format,
          matches_created: createdMatches.length
        },
        matches: createdMatches
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Generate matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments/:id/matches
 * Get all matches for a tournament (Public)
 */
exports.getTournamentMatches = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const { round } = req.query;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Get matches
    let matches;
    if (round) {
      matches = await Match.findByRound(tournamentId, parseInt(round));
    } else {
      matches = await Match.findByTournament(tournamentId);
    }

    // Group matches by round for knockout format
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round_number]) {
        matchesByRound[match.round_number] = [];
      }
      matchesByRound[match.round_number].push(match);
    });

    // Add round names for knockout
    const roundsWithNames = Object.keys(matchesByRound).map(roundNum => {
      const roundNumber = parseInt(roundNum);
      const totalRounds = tournament.format === 'knockout' 
        ? Math.log2(tournament.max_players)
        : 1;
      
      return {
        round_number: roundNumber,
        round_name: tournament.format === 'knockout' 
          ? getRoundName(totalRounds, roundNumber)
          : 'League Matches',
        matches: matchesByRound[roundNum]
      };
    });

    res.json({
      success: true,
      tournament: {
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        format: tournament.format,
        status: tournament.status
      },
      total_matches: matches.length,
      rounds: roundsWithNames
    });

  } catch (error) {
    console.error('Get tournament matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /matches/:id
 * Get match details by ID (Public)
 */
exports.getMatchById = async (req, res) => {
  try {
    const { id: matchId } = req.params;

    const match = await Match.findByIdWithDetails(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      match
    });

  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /tournaments/:id/matches
 * Delete all matches for a tournament (Organizer only, upcoming only)
 */
exports.deleteMatches = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user.user_id;

    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can delete matches'
      });
    }

    // Get tournament details
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if user is the tournament organizer
    if (tournament.organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete matches for your own tournaments'
      });
    }

    // Check if tournament is upcoming (allow deletion to regenerate)
    if (tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete matches for completed tournaments'
      });
    }

    // Delete matches and update tournament status
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete all matches
      const deleteQuery = `
        DELETE FROM matches
        WHERE tournament_id = $1
      `;
      const deleteResult = await client.query(deleteQuery, [tournamentId]);

      // Update tournament status back to upcoming
      const updateQuery = `
        UPDATE tournaments
        SET status = 'upcoming', updated_at = CURRENT_TIMESTAMP
        WHERE tournament_id = $1
        RETURNING *
      `;
      await client.query(updateQuery, [tournamentId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Matches deleted successfully',
        deleted_count: deleteResult.rowCount
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * PATCH /matches/:id/score
 * Submit match score (