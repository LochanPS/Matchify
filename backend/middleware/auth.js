const { verifyIdToken } = require('../config/firebase');
const db = require('../config/database');

/**
 * Middleware to verify Firebase JWT token
 * Attaches user info to req.user
 */
async function authenticateUser(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please include Authorization header with Bearer token.'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase
    const result = await verifyIdToken(idToken);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: result.error
      });
    }
    
    // Get user from database
    const userQuery = await db.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [result.uid]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database. Please complete signup.'
      });
    }
    
    // Attach user to request
    req.user = userQuery.rows[0];
    req.firebaseUid = result.uid;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
}

/**
 * Middleware to check if user is an organizer
 */
function requireOrganizer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.'
    });
  }
  
  next();
}

/**
 * Middleware to check if user is an admin
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  next();
}

/**
 * Middleware to check if user is a player
 */
function requirePlayer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'player') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Player role required.'
    });
  }
  
  next();
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const result = await verifyIdToken(idToken);
    
    if (result.success) {
      const userQuery = await db.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [result.uid]
      );
      
      if (userQuery.rows.length > 0) {
        req.user = userQuery.rows[0];
        req.firebaseUid = result.uid;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    req.user = null;
    next();
  }
}

module.exports = {
  authenticateUser,
  requireOrganizer,
  requirePlayer,
  requireAdmin,
  optionalAuth
};
