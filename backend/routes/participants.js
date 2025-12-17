const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { authenticateUser } = require('../middleware/auth');

/**
 * Public routes
 */

// GET /tournaments/:id/participants - Get tournament participants
router.get('/tournaments/:id/participants', participantController.getParticipants);

/**
 * Protected routes (require authentication)
 */

// POST /tournaments/:id/join - Join tournament (player only)
router.post('/tournaments/:id/join', authenticateUser, participantController.joinTournament);

// DELETE /tournaments/:id/leave - Leave tournament (player only)
router.delete('/tournaments/:id/leave', authenticateUser, participantController.leaveTournament);

// GET /tournaments/:id/check-participation - Check if user is participant
router.get('/tournaments/:id/check-participation', authenticateUser, participantController.checkParticipation);

// GET /users/:id/tournaments - Get user's joined tournaments
router.get('/users/:id/tournaments', authenticateUser, participantController.getUserTournaments);

module.exports = router;
