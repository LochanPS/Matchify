/**
 * MATCHIFY Help Center & FAQ Routes
 * Support documentation and FAQ management
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const db = require('../config/database');

/**
 * GET /api/help/faq
 * Get all FAQ items with optional category filter
 */
router.get('/faq', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM faq_items WHERE is_active = true';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      query += ' AND (question ILIKE $' + (params.length + 1) + ' OR answer ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      faq: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ',
      error: error.message
    });
  }
});

/**
 * GET /api/help/categories
 * Get all FAQ categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM faq_items
      WHERE is_active = true
      GROUP BY category
      ORDER BY category ASC
    `);

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

/**
 * GET /api/help/faq/:id
 * Get single FAQ item
 */
router.get('/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM faq_items WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    // Increment view count
    await db.query(
      'UPDATE faq_items SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      faq: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ item',
      error: error.message
    });
  }
});

/**
 * POST /api/help/faq/helpful
 * Mark FAQ as helpful
 */
router.post('/faq/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (helpful === undefined) {
      return res.status(400).json({
        success: false,
        message: 'helpful parameter required'
      });
    }

    const column = helpful ? 'helpful_count' : 'unhelpful_count';
    await db.query(
      `UPDATE faq_items SET ${column} = ${column} + 1 WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

/**
 * GET /api/help/guides
 * Get getting started guides
 */
router.get('/guides', async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM help_guides WHERE is_active = true';
    const params = [];

    if (role) {
      query += ' AND (target_role = $' + (params.length + 1) + ' OR target_role = \'all\')';
      params.push(role);
    }

    query += ' ORDER BY display_order ASC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      guides: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guides',
      error: error.message
    });
  }
});

/**
 * GET /api/help/troubleshooting
 * Get troubleshooting articles
 */
router.get('/troubleshooting', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM troubleshooting_articles WHERE is_active = true';
    const params = [];

    if (search) {
      query += ' AND (title ILIKE $' + (params.length + 1) + ' OR content ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY display_order ASC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      articles: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch troubleshooting articles',
      error: error.message
    });
  }
});

/**
 * POST /api/help/contact
 * Submit support contact form
 */
router.post('/contact', authenticateUser, async (req, res) => {
  try {
    const { subject, message, category } = req.body;

    if (!subject || !message || !category) {
      return res.status(400).json({
        success: false,
        message: 'subject, message, and category required'
      });
    }

    const result = await db.query(
      `INSERT INTO support_tickets (user_id, subject, message, category, status, created_at)
       VALUES ($1, $2, $3, $4, 'open', NOW())
       RETURNING id, created_at`,
      [req.user.user_id, subject, message, category]
    );

    res.json({
      success: true,
      message: 'Support ticket created',
      ticket_id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
});

/**
 * GET /api/help/tickets/:id
 * Get support ticket status
 */
router.get('/tickets/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM support_tickets 
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
});

/**
 * GET /api/help/tickets
 * Get user's support tickets
 */
router.get('/tickets', authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM support_tickets 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      tickets: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
});

/**
 * POST /api/help/feedback
 * Submit general feedback
 */
router.post('/feedback', authenticateUser, async (req, res) => {
  try {
    const { type, message, rating } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'type and message required'
      });
    }

    await db.query(
      `INSERT INTO user_feedback (user_id, type, message, rating, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.user_id, type, message, rating || null]
    );

    res.json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

module.exports = router;
