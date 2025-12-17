const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { authenticateUser, requireOrganizer } = require('../middleware/auth');

/**
 * Protected routes (require authentication)
 */

// POST /matches/:id/score - Submit match score (organizer only)
router.post('/matches/:id/score', authenticateUser, requireOrganizer, scoreController.submitScore);

/**
 * Public routes
 */

// GET /tournaments/:id/leaderboard - Get tournament leaderboard (league format)
router.get('/tournaments/:id/leaderboard', scoreController.getLeaderboard);

module.exports = router;
