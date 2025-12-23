const express = require('express');
const dotenv = require('dotenv');
const { authenticateUser } = require('./middleware/auth');

// Day 42 improvements
const { applySecurity, errorHandler, authLimiter, createLimiter } = require('./middleware/security');
const { performanceMiddleware, compressionMiddleware, healthCheck, optimizeResponse } = require('./utils/performance');

// Load environment variables
dotenv.config();

// Initialize Firebase (will log warning if service account not found)
require('./config/firebase');

// Initialize Express app
const app = express();

// Apply Day 42 security improvements
console.log('Applying Day 42 security and performance improvements...');
applySecurity(app);

// Performance middleware
app.use(performanceMiddleware);
app.use(compressionMiddleware);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route for testing
app.get('/', (req, res) => {
  const response = optimizeResponse({
    message: 'MATCHIFY API - Day 42 Optimized',
    version: '1.0.0',
    status: 'running',
    security: 'enhanced',
    performance: 'optimized',
    endpoints: {
      health: '/health',
      testAuth: '/api/test-auth (protected)',
      metrics: '/metrics (protected)'
    }
  }, req);
  
  res.json(response);
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Performance metrics endpoint (protected)
app.get('/metrics', authenticateUser, (req, res) => {
  // Only allow organizers to view metrics
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  const { performanceMetrics, memoryMonitor } = require('./utils/performance');
  
  res.json({
    success: true,
    metrics: {
      performance: performanceMetrics.getStats(),
      memory: memoryMonitor.getMemoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tournamentRoutes = require('./routes/tournaments');
const participantRoutes = require('./routes/participants');
const matchRoutes = require('./routes/matches');
const scoreRoutes = require('./routes/scores');
const paymentRoutes = require('./routes/payments');
const categoryRoutes = require('./routes/categories');
const posterRoutes = require('./routes/posters');
const feedbackRoutes = require('./routes/feedback');
const { router: referralRoutes } = require('./routes/referrals');
const socialRoutes = require('./routes/social');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');
const templateRoutes = require('./routes/templates');
const analyticsRoutes = require('./routes/analytics');
const analyticsAdvancedRoutes = require('./routes/analytics-advanced');
const monitoringRoutes = require('./routes/monitoring');
const helpRoutes = require('./routes/help');

// API Routes with rate limiting
app.use('/auth', authLimiter, authRoutes); // Strict rate limiting for auth
app.use('/users', userRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/', participantRoutes); // Participant routes use /tournaments and /users prefixes
app.use('/', matchRoutes); // Match routes use /tournaments and /matches prefixes
app.use('/', scoreRoutes); // Score routes use /matches and /tournaments prefixes
app.use('/payments', paymentRoutes); // Payment routes
app.use('/', categoryRoutes); // Category routes
app.use('/', posterRoutes); // Poster routes
app.use('/feedback', feedbackRoutes); // Feedback routes
app.use('/api/referrals', referralRoutes); // Referral routes
app.use('/api', socialRoutes); // Social sharing and growth routes
app.use('/api/community', communityRoutes); // Community routes
app.use('/api/notifications', notificationRoutes); // Notification routes
app.use('/api/templates', templateRoutes); // Tournament template routes
app.use('/api/analytics', analyticsRoutes); // Analytics routes
app.use('/api/analytics', analyticsAdvancedRoutes); // Advanced analytics routes
app.use('/api/monitoring', monitoringRoutes); // Monitoring routes
app.use('/api/help', helpRoutes); // Help center and support routes

// Tournament creation with rate limiting
app.use('/tournaments', createLimiter);

// Test protected route
app.get('/api/test-auth', authenticateUser, (req, res) => {
  const response = optimizeResponse({
    success: true,
    message: 'Authentication successful! (Day 42 Enhanced)',
    user: {
      user_id: req.user.user_id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      city: req.user.city
    },
    security: 'enhanced',
    timestamp: new Date().toISOString()
  }, req);
  
  res.json(response);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Use Day 42 enhanced error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (Day 42 Enhanced)`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔒 Security: Enhanced`);
  console.log(`⚡ Performance: Optimized`);
  console.log(`📊 Monitoring: Active`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
