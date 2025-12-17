const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');

/**
 * POST /auth/signup
 * Create new user account
 */
router.post('/signup', validateSignup, authController.signup);

/**
 * POST /auth/login
 * Authenticate existing user
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;
