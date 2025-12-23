const { query } = require('../config/database');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Mock cloud storage URL generator (replace with actual S3/Cloudinary)
const generatePosterUrl = (tournamentId, filename) => {
  // In production, upload to S3/Cloudinary and return actual URL
  // For now, return a mock URL
  return `https://cdn.matchify.app/posters/${tournamentId}-${Date.now()}.jpg`;
};

// Upload middleware
const uploadMiddleware = upload.single('poster');

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Upload tournament poster
const uploadPoster = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const organizer_id = req.user.uid;

    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify tournament exists and organizer owns it
    const tournamentResult = await query(
      'SELECT tournament_id, organizer_id FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate poster URL (in production, upload to S3/Cloudinary)
    const poster_url = generatePosterUrl(tournamentId, req.file.originalname);

    // Update tournament with poster URL
    await query(
      'UPDATE tournaments SET poster_url = ? WHERE tournament_id = ?',
      [poster_url, tournamentId]
    );

    // Store in tournament_media table
    await query(
      `INSERT INTO tournament_media (tournament_id, media_type, media_url, uploaded_by)
       VALUES (?, ?, ?, ?)`,
      [tournamentId, 'poster', poster_url, organizer_id]
    );

    res.json({
      success: true,
      poster_url,
      message: 'Poster uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading poster:', error);
    res.status(500).json({ error: 'Failed to upload poster' });
  }
};

// Get tournament poster
const getPoster = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const result = await query(
      'SELECT poster_url FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      success: true,
      poster_url: result.rows[0].poster_url,
    });
  } catch (error) {
    console.error('Error getting poster:', error);
    res.status(500).json({ error: 'Failed to get poster' });
  }
};

// Replace tournament poster
const replacePoster = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const organizer_id = req.user.uid;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify tournament exists and organizer owns it
    const tournamentResult = await query(
      'SELECT tournament_id, organizer_id FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const poster_url = generatePosterUrl(tournamentId, req.file.originalname);

    await query(
      'UPDATE tournaments SET poster_url = ? WHERE tournament_id = ?',
      [poster_url, tournamentId]
    );

    res.json({
      success: true,
      poster_url,
      message: 'Poster replaced successfully',
    });
  } catch (error) {
    console.error('Error replacing poster:', error);
    res.status(500).json({ error: 'Failed to replace poster' });
  }
};

// Remove tournament poster
const removePoster = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const organizer_id = req.user.uid;

    const tournamentResult = await query(
      'SELECT tournament_id, organizer_id FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await query(
      'UPDATE tournaments SET poster_url = NULL WHERE tournament_id = ?',
      [tournamentId]
    );

    res.json({
      success: true,
      message: 'Poster removed successfully',
    });
  } catch (error) {
    console.error('Error removing poster:', error);
    res.status(500).json({ error: 'Failed to remove poster' });
  }
};

// Get signed upload URL
const getUploadUrl = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const organizer_id = req.user.uid;

    const tournamentResult = await query(
      'SELECT tournament_id, organizer_id FROM tournaments WHERE tournament_id = ?',
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // In production, generate signed URL for S3/Cloudinary
    const uploadUrl = `https://api.matchify.app/posters/upload/${tournamentId}`;

    res.json({
      success: true,
      upload_url: uploadUrl,
      expires_in: 3600,
    });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
};

module.exports = {
  uploadPoster,
  getPoster,
  replacePoster,
  removePoster,
  getUploadUrl,
  uploadMiddleware,
  handleUploadError,
};
