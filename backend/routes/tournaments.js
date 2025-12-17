const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authenticateUser, requireOrganizer } = require('../middleware/auth');

/**
 * Public routes
 */

// GET /tournaments - List all tournaments with filters
router.get('/', tournamentController.getTournaments);

// GET /tournaments/:id - Get tournament details
router.get('/:id', tournamentController.getTournamentById);

/**
 * Protected routes (require authentication)
 */

// POST /tournaments - Create tournament (organizer only)
router.post('/', authenticateUser, requireOrganizer, tournamentController.createTournament);

// PATCH /tournaments/:id - Update tournament (organizer only)
router.patch('/:id', authenticateUser, requireOrganizer, tournamentController.updateTournament);

// DELETE /tournaments/:id - Delete tournament (organizer only)
router.delete('/:id', authenticateUser, requireOrganizer, tournamentController.deleteTournament);

/**
 * Organizer-specific routes
 */

// GET /organizers/:id/tournaments - Get organizer's tournaments
router.get('/organizer/:id', authenticateUser, tournamentController.getOrganizerTournaments);

module.exports = router;
