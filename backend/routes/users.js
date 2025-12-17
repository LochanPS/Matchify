const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

/**
 * GET /users/:id/profile
 * Get user profile (public)
 */
router.get('/:id/profile', userController.getProfile);

/**
 * PATCH /users/:id/profile
 * Update user profile (authenticated)
 */
router.patch('/:id/profile', authenticateUser, validateProfileUpdate, userController.updateProfile);

/**
 * GET /users/:id/stats
 * Get player statistics (public)
 */
router.get('/:id/stats', userController.getPlayerStats);

module.exports = router;
