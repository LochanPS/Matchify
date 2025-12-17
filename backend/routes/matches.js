const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticateUser, requireOrganizer } = require('../middleware/auth');

/**
 * Public routes
 */

// GET /tournaments/:id/matches - Get tournament matches
router.get('/tournaments/:id/matches', matchController.getTournamentMatches);

// GET /matches/:id - Get match details
router.get('/matches/:id', matchController.getMatchById);

/**
 * Protected routes (require authentication)
 */

// POST /tournaments/:id/generate-matches - Generate matches (organizer only)
router.post('/tournaments/:id/generate-matches', authenticateUser, requireOrganizer, matchController.generateMatches);

// DELETE /tournaments/:id/matches - Delete all matches (organizer only)
router.delete('/tournaments/:id/matches', authenticateUser, requireOrganizer, matchController.deleteMatches);

module.exports = router;
