// Tournament Poster Upload API Routes
// Handles poster upload, update, and deletion via Cloudinary

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// Configure multer for temporary file storage
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /tournament-posters/:tournament_id
 * Upload or replace tournament poster
 */
router.post('/:tournament_id', authenticateToken, upload.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { tournament_id } = req.params;

    // Get tournament
    const tournamentResult = await db.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournament = tournamentResult.rows[0];

    // Verify organizer ownership
    if (tournament.organizer_id !== req.user.user_id) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete old poster if exists
    if (tournament.poster_public_id) {
      await deleteImage(tournament.poster_public_id);
    }

    // Upload new poster to Cloudinary
    const uploadResult = await uploadImage(
      req.file.path,
      'courtify/tournament-posters'
    );

    if (!uploadResult.success) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Failed to upload poster' });
    }

    // Update tournament in database
    const updateResult = await db.query(
      `UPDATE tournaments
       SET poster_url = $1, poster_public_id = $2, updated_at = NOW()
       WHERE tournament_id = $3
       RETURNING *`,
      [uploadResult.url, uploadResult.publicId, tournament_id]
    );

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Poster uploaded successfully',
      poster_url: uploadResult.url,
      poster_public_id: uploadResult.publicId,
      tournament: updateResult.rows[0]
    });
  } catch (error) {
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Poster upload error:', error);
    res.status(500).json({ error: 'Failed to upload poster' });
  }
});

/**
 * DELETE /tournament-posters/:tournament_id
 * Remove tournament poster
 */
router.delete('/:tournament_id', authenticateToken, async (req, res) => {
  try {
    const { tournament_id } = req.params;

    // Get tournament
    const tournamentResult = await db.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournament = tournamentResult.rows[0];

    // Verify organizer ownership
    if (tournament.organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete from Cloudinary if exists
    if (tournament.poster_public_id) {
      await deleteImage(tournament.poster_public_id);
    }

    // Update tournament in database
    const updateResult = await db.query(
      `UPDATE tournaments
       SET poster_url = NULL, poster_public_id = NULL, updated_at = NOW()
       WHERE tournament_id = $1
       RETURNING *`,
      [tournament_id]
    );

    res.json({
      message: 'Poster removed successfully',
      tournament: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Poster deletion error:', error);
    res.status(500).json({ error: 'Failed to remove poster' });
  }
});

/**
 * GET /tournament-posters/:tournament_id
 * Get tournament poster details
 */
router.get('/:tournament_id', async (req, res) => {
  try {
    const { tournament_id } = req.params;

    const result = await db.query(
      'SELECT tournament_id, poster_url, poster_public_id FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournament = result.rows[0];

    if (!tournament.poster_url) {
      return res.status(404).json({ error: 'No poster for this tournament' });
    }

    res.json({
      tournament_id: tournament.tournament_id,
      poster_url: tournament.poster_url,
      poster_public_id: tournament.poster_public_id
    });
  } catch (error) {
    console.error('Get poster error:', error);
    res.status(500).json({ error: 'Failed to fetch poster' });
  }
});

module.exports = router;
