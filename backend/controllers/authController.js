const User = require('../models/User');
const { verifyIdToken, createUser: createFirebaseUser } = require('../config/firebase');

/**
 * POST /auth/signup
 * Create new user account
 */
exports.signup = async (req, res) => {
  try {
    const { idToken, name, city, role, skill_level, organizer_contact } = req.body;

    // Verify Firebase token
    const tokenResult = await verifyIdToken(idToken);
    
    if (!tokenResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase token',
        error: tokenResult.error
      });
    }

    const firebase_uid = tokenResult.uid;
    const email = tokenResult.email;

    // Check if user already exists
    const existingUser = await User.findByFirebaseUid(firebase_uid);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }

    // Validate role-specific fields
    if (role === 'player' && !skill_level) {
      return res.status(400).json({
        success: false,
        message: 'Skill level is required for players'
      });
    }

    if (role === 'organizer' && !organizer_contact) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required for organizers'
      });
    }

    // Create user in database
    const user = await User.create({
      firebase_uid,
      name: name.trim(),
      email,
      city: city.trim(),
      role,
      skill_level: role === 'player' ? skill_level : null,
      organizer_contact: role === 'organizer' ? organizer_contact : null
    });

    // Remove sensitive data
    const { firebase_uid: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /auth/login
 * Authenticate existing user
 */
exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase token
    const tokenResult = await verifyIdToken(idToken);
    
    if (!tokenResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase token',
        error: tokenResult.error
      });
    }

    const firebase_uid = tokenResult.uid;

    // Find user in database
    const user = await User.findByFirebaseUid(firebase_uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    // Remove sensitive data
    const { firebase_uid: _, ...userResponse } = user;

    // Calculate win rate for players
    if (user.role === 'player') {
      userResponse.win_rate = user.matches_played > 0
        ? ((user.wins / user.matches_played) * 100).toFixed(1)
        : '0.0';
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
