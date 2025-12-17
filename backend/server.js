const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { authenticateUser } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Initialize Firebase (will log warning if service account not found)
require('./config/firebase');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pathfinder Enhanced API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      testAuth: '/api/test-auth (protected)'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    firebase: 'configured'
  });
});

// Test protected route
app.get('/api/test-auth', authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful!',
    user: {
      user_id: req.user.user_id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      city: req.user.city
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
