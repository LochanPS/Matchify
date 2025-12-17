const Tournament = require('../models/Tournament');

/**
 * POST /tournaments
 * Create new tournament (Organizer only)
 */
exports.createTournament = async (req, res) => {
  try {
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can create tournaments'
      });
    }

    const {
      tournament_name,
      venue,
      tournament_date,
      match_type,
      format,
      entry_fee,
      prize_money,
      max_players
    } = req.body;

    // Validate required fields
    if (!tournament_name || !venue || !tournament_date || !match_type || !format || !max_players) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['tournament_name', 'venue', 'tournament_date', 'match_type', 'format', 'max_players']
      });
    }

    // Validate date is in future
    const tournamentDate = new Date(tournament_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tournamentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Tournament date must be today or in the future'
      });
    }

    // Validate max_players
    const maxPlayersInt = parseInt(max_players);
    if (![8, 16, 32].includes(maxPlayersInt)) {
      return res.status(400).json({
        success: false,
        message: 'Max players must be 8, 16, or 32'
      });
    }

    // Validate match_type
    if (!['singles', 'doubles'].includes(match_type)) {
      return res.status(400).json({
        success: false,
        message: 'Match type must be "singles" or "doubles"'
      });
    }

    // Validate format
    if (!['knockout', 'league'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format must be "knockout" or "league"'
      });
    }

    // Validate entry_fee and prize_money
    if (entry_fee && (isNaN(entry_fee) || entry_fee < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Entry fee must be a positive number'
      });
    }

    if (prize_money && (isNaN(prize_money) || prize_money < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Prize money must be a positive number'
      });
    }

    // Create tournament
    const tournament = await Tournament.create({
      organizer_id: req.user.user_id,
      tournament_name: tournament_name.trim(),
      venue: venue.trim(),
      tournament_date,
      match_type,
      format,
      entry_fee: entry_fee || 0,
      prize_money: prize_money || 0,
      max_players: maxPlayersInt
    });

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments
 * List all tournaments with filters
 */
exports.getTournaments = async (req, res) => {
  try {
    const {
      status = 'upcoming',
      city,
      match_type,
      format,
      date_from,
      date_to,
      limit = 20,
      offset = 0
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (match_type) filters.match_type = match_type;
    if (format) filters.format = format;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const tournaments = await Tournament.findAll(
      filters,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      count: tournaments.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      tournaments
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /tournaments/:id
 * Get tournament details by ID
 */
exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /organizers/:id/tournaments
 * Get all tournaments by organizer
 */
exports.getOrganizerTournaments = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Check if requesting own tournaments or if admin
    if (req.user.user_id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own tournaments'
      });
    }

    const tournaments = await Tournament.findByOrganizer(id, status);

    res.json({
      success: true,
      count: tournaments.length,
      tournaments
    });
  } catch (error) {
    console.error('Get organizer tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /tournaments/:id
 * Update tournament (Organizer only, upcoming tournaments only)
 */
exports.updateTournament = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can edit this tournament
    const canEdit = await Tournament.canEdit(id, req.user.user_id);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own upcoming tournaments'
      });
    }

    const {
      tournament_name,
      venue,
      tournament_date,
      match_type,
      format,
      entry_fee,
      prize_money,
      max_players
    } = req.body;

    // Build updates object
    const updates = {};
    if (tournament_name !== undefined) updates.tournament_name = tournament_name.trim();
    if (venue !== undefined) updates.venue = venue.trim();
    if (tournament_date !== undefined) {
      // Validate date is in future
      const tournamentDate = new Date(tournament_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (tournamentDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Tournament date must be today or in the future'
        });
      }
      updates.tournament_date = tournament_date;
    }
    if (match_type !== undefined) {
      if (!['singles', 'doubles'].includes(match_type)) {
        return res.status(400).json({
          success: false,
          message: 'Match type must be "singles" or "doubles"'
        });
      }
      updates.match_type = match_type;
    }
    if (format !== undefined) {
      if (!['knockout', 'league'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format must be "knockout" or "league"'
        });
      }
      updates.format = format;
    }
    if (entry_fee !== undefined) updates.entry_fee = entry_fee;
    if (prize_money !== undefined) updates.prize_money = prize_money;
    if (max_players !== undefined) {
      const maxPlayersInt = parseInt(max_players);
      if (![8, 16, 32].includes(maxPlayersInt)) {
        return res.status(400).json({
          success: false,
          message: 'Max players must be 8, 16, or 32'
        });
      }
      updates.max_players = maxPlayersInt;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedTournament = await Tournament.update(id, updates);

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /tournaments/:id
 * Delete tournament (Organizer only, upcoming tournaments only)
 */
exports.deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can edit this tournament
    const canEdit = await Tournament.canEdit(id, req.user.user_id);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own upcoming tournaments'
      });
    }

    const deletedTournament = await Tournament.delete(id);

    if (!deletedTournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      message: 'Tournament deleted successfully',
      tournament: deletedTournament
    });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
