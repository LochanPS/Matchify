const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const posterController = require('../controllers/posterController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for poster uploads
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload tournament poster
router.post(
  '/tournaments/:tournamentId/poster',
  authenticateUser,
  uploadRateLimit,
  posterController.uploadMiddleware,
  posterController.handleUploadError,
  posterController.uploadPoster
);

// Get tournament poster
router.get(
  '/tournaments/:tournamentId/poster',
  posterController.getPoster
);

// Replace tournament poster
router.patch(
  '/tournaments/:tournamentId/poster',
  authenticateUser,
  uploadRateLimit,
  posterController.uploadMiddleware,
  posterController.handleUploadError,
  posterController.replacePoster
);

// Remove tournament poster
router.delete(
  '/tournaments/:tournamentId/poster',
  authenticateUser,
  posterController.removePoster
);

// Get signed upload URL (for direct client uploads)
router.get(
  '/tournaments/:tournamentId/poster/upload-url',
  authenticateUser,
  posterController.getUploadUrl
);

module.exports = router;