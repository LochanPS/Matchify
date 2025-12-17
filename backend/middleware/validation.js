const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validation rules for user signup
 */
exports.validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('role')
    .isIn(['player', 'organizer'])
    .withMessage('Role must be either "player" or "organizer"'),
  
  body('skill_level')
    .if(body('role').equals('player'))
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Skill level must be beginner, intermediate, or advanced for players'),
  
  body('organizer_contact')
    .if(body('role').equals('organizer'))
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Organizer contact must be a valid 10-digit Indian phone number'),
  
  checkValidation
];

/**
 * Validation rules for profile update
 */
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('skill_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Skill level must be beginner, intermediate, or advanced'),
  
  body('organizer_contact')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Organizer contact must be a valid 10-digit Indian phone number'),
  
  checkValidation
];

/**
 * Validation rules for login
 */
exports.validateLogin = [
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token is required'),
  
  checkValidation
];
