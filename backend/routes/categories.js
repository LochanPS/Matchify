const express = require('express');
const { body } = require('express-validator');
const { authenticateUser } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Validation middleware
const validateCategory = [
  body('category_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('match_type')
    .isIn(['singles', 'doubles', 'mixed_doubles'])
    .withMessage('Match type must be singles, doubles, or mixed_doubles'),
  body('entry_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Entry fee must be a positive number'),
  body('prize_money_winner')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Prize money winner must be a positive number'),
  body('prize_money_runner_up')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Prize money runner up must be a positive number'),
  body('max_participants')
    .isInt({ min: 2, max: 128 })
    .withMessage('Max participants must be between 2 and 128'),
  body('format')
    .optional()
    .isIn(['knockout', 'league', 'group_knockout'])
    .withMessage('Format must be knockout, league, or group_knockout'),
  body('points_per_game')
    .optional()
    .isInt({ min: 11, max: 30 })
    .withMessage('Points per game must be between 11 and 30'),
  body('best_of')
    .optional()
    .isIn([1, 3, 5])
    .withMessage('Best of must be 1, 3, or 5'),
];

const validateRegistration = [
  body('player_id')
    .isUUID()
    .withMessage('Player ID must be a valid UUID'),
  body('partner_id')
    .optional()
    .isUUID()
    .withMessage('Partner ID must be a valid UUID'),
  body('partner_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Partner name must be between 1 and 100 characters'),
  body('partner_email')
    .optional()
    .isEmail()
    .withMessage('Partner email must be valid'),
  body('partner_phone')
    .optional()
    .isMobilePhone()
    .withMessage('Partner phone must be valid'),
];

// Category CRUD routes
router.post('/tournaments/:tournamentId/categories', 
  authenticateUser, 
  validateCategory, 
  categoryController.createCategory
);

router.get('/tournaments/:tournamentId/categories', 
  categoryController.getCategoriesByTournament
);

router.get('/categories/:categoryId', 
  categoryController.getCategoryById
);

router.patch('/categories/:categoryId', 
  authenticateUser, 
  validateCategory, 
  categoryController.updateCategory
);

router.delete('/categories/:categoryId', 
  authenticateUser, 
  categoryController.deleteCategory
);

// Category registration routes
router.post('/categories/:categoryId/register', 
  authenticateUser, 
  validateRegistration, 
  categoryController.registerForCategory
);

router.get('/categories/:categoryId/participants', 
  categoryController.getCategoryParticipants
);

router.delete('/categories/:categoryId/leave', 
  authenticateUser, 
  categoryController.leaveCategory
);

module.exports = router;