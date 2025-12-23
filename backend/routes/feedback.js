const express = require('express');
const { body } = require('express-validator');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// Validation middleware
const validateFeedback = [
  body('feedback_type')
    .isIn(['bug', 'feature', 'improvement', 'general'])
    .withMessage('Invalid feedback type'),
  body('category')
    .isIn(['ui', 'performance', 'functionality', 'mobile', 'other'])
    .withMessage('Invalid category'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('user_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
];

// Submit feedback (public endpoint, but better if authenticated)
router.post('/', optionalAuth, validateFeedback, feedbackController.submitFeedback);

// Get all feedback (admin only)
router.get('/', authenticateUser, feedbackController.getAllFeedback);

// Get feedback statistics (admin only)
router.get('/stats', authenticateUser, feedbackController.getFeedbackStats);

// Get user's own feedback
router.get('/my-feedback', authenticateUser, feedbackController.getUserFeedback);

// Update feedback status (admin only)
router.patch('/:id', authenticateUser, [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
], feedbackController.updateFeedbackStatus);

module.exports = router;