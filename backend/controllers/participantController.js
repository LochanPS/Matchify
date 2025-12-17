const Participant = require('../models/Participant');
const Tournament = require('../models/Tournament');

/**
 * POST /tournaments/:id/join
 * Join a tournament (Player only)
 */
exports.joinTournament = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user.user_id;

    // Check if user is a player
    if (req.user.role !== 'player') {
      return res.status(403).json({
        success: false,
        message: 'Only players can join tournaments'
      });
    }

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if tournament is upcoming
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Can only join upcoming tournaments'
      });
    }

    // Check if already joined
    const alreadyJoined = await Participant.isParticipant(tournamentId, userId);
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this tournament'
      });
    }

    // Check if tournament has space
    const hasSpace = await Participant.hasSpace(tournamentId);
    if (!hasSpace) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Join tournament
    const participant = await Participant.join(tournamentId, userId);

    // Get updated participant count
    const participantCount = await Participant.getCount(tournamentId);

    res.status(201).json({
      success: true,
      message: 'Successfully joined tournament',
      participant,
      tournament: {
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        current_players: participantCount,
        max_players: tournament.max_players
      }
    });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /tournaments/:id/leave
 * Leave a tournament (Player only)
 */
exports.leaveTournament = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user.user_id;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if tournament is upcoming
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Can only leave upcoming tournaments'
      });
    }

    // Check if user is a participant
    const isParticipant = await Participant.isParticipant(tournamentId, userId);
    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this tournament'
      });
    }

    // Leave tournament
    const participant = await Participant.leave(tournamentId, userId);

    // Get updated participant count
    const participantCount = await Participant.getCount(tournamentId);

    res.json({
      success: true,
      message: 'Successfully left tournament',
      participant,
      tournament: {
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        current_players: participantCount,
        max_players: tournament.max_players
      }
    });
  } catch (error) {
    console.error('Leave tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments/:id/participants
 * Get all participants for a tournament (Public)
 */
exports.getParticipants = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Get participants
    const participants = await Participant.findByTournament(tournamentId);

    res.json({
      success: true,
      count: participants.length,
      tournament: {
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        max_players: tournament.max_players,
        status: tournament.status
      },
      participants
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /users/:id/tournaments
 * Get all tournaments a user has joined (Protected)
 */
exports.getUserTournaments = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { status } = req.query;

    // Check if requesting own tournaments
    if (req.user.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own tournaments'
      });
    }

    // Get tournaments
    const tournaments = await Participant.findByUser(userId, status);

    res.json({
      success: true,
      count: tournaments.length,
      tournaments
    });
  } catch (error) {
    console.error('Get user tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments/:id/check-participation
 * Check if current user is a participant (Protected)
 */
exports.checkParticipation = async (req, res) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user.user_id;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check participation
    const isParticipant = await Participant.isParticipant(tournamentId, userId);

    res.json({
      success: true,
      tournament_id: tournamentId,
      user_id: userId,
      is_participant: isParticipant
    });
  } catch (error) {
    console.error('Check participation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check participation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
