const { query } = require('../config/database');
const { validationResult } = require('express-validator');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      feedback_type,
      category,
      title,
      description,
      page_url,
      browser_info,
    } = req.body;

    // Get user info if authenticated
    const user_id = req.user ? req.user.user_id : null;
    const user_email = req.user ? req.user.email : req.body.user_email;
    const user_role = req.user ? req.user.role : 'anonymous';

    // Auto-prioritize based on feedback type and user role
    let priority = 'medium';
    if (feedback_type === 'bug' && user_role === 'organizer') {
      priority = 'high';
    } else if (feedback_type === 'bug') {
      priority = 'medium';
    } else if (feedback_type === 'feature' && user_role === 'organizer') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    const insertQuery = `
      INSERT INTO feedback (
        user_id, feedback_type, category, title, description, 
        priority, user_email, user_role, page_url, browser_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      user_id,
      feedback_type,
      category,
      title,
      description,
      priority,
      user_email,
      user_role,
      page_url,
      browser_info,
    ]);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    // Check if user is admin/organizer
    if (!req.user || req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { status, type, category, priority, limit = 50, offset = 0 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND feedback_type = $${paramCount}`;
      params.push(type);
    }

    if (category) {
      paramCount++;
      whereClause += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (priority) {
      paramCount++;
      whereClause += ` AND priority = $${paramCount}`;
      params.push(priority);
    }

    const selectQuery = `
      SELECT 
        f.*,
        u.name as user_name
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.user_id
      ${whereClause}
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(selectQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM feedback ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, paramCount));

    res.json({
      success: true,
      feedback: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: error.message,
    });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    // Check if user is admin/organizer
    if (!req.user || req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_feedback,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_feedback,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_feedback,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_feedback,
        COUNT(CASE WHEN feedback_type = 'bug' THEN 1 END) as bug_reports,
        COUNT(CASE WHEN feedback_type = 'feature' THEN 1 END) as feature_requests,
        COUNT(CASE WHEN feedback_type = 'improvement' THEN 1 END) as improvements,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_issues,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_feedback
      FROM feedback
    `;

    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        AVG(CASE 
          WHEN priority = 'critical' THEN 4
          WHEN priority = 'high' THEN 3
          WHEN priority = 'medium' THEN 2
          WHEN priority = 'low' THEN 1
        END) as avg_priority_score
      FROM feedback
      GROUP BY category
      ORDER BY count DESC
    `;

    const trendQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN feedback_type = 'bug' THEN 1 END) as bugs,
        COUNT(CASE WHEN feedback_type = 'feature' THEN 1 END) as features
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const [statsResult, categoryResult, trendResult] = await Promise.all([
      query(statsQuery),
      query(categoryQuery),
      query(trendQuery),
    ]);

    res.json({
      success: true,
      stats: statsResult.rows[0],
      by_category: categoryResult.rows,
      trend: trendResult.rows,
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback statistics',
      error: error.message,
    });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    // Check if user is admin/organizer
    if (!req.user || req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { id } = req.params;
    const { status, priority, notes } = req.body;

    const updateQuery = `
      UPDATE feedback 
      SET 
        status = COALESCE($1, status),
        priority = COALESCE($2, priority),
        updated_at = NOW()
      WHERE feedback_id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [status, priority, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Log the update
    if (notes) {
      const logQuery = `
        INSERT INTO feedback_logs (feedback_id, action, notes, updated_by)
        VALUES ($1, $2, $3, $4)
      `;
      await query(logQuery, [id, 'status_update', notes, req.user.user_id]);
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: error.message,
    });
  }
};

// Get user's own feedback
exports.getUserFeedback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const selectQuery = `
      SELECT *
      FROM feedback
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [req.user.user_id]);

    res.json({
      success: true,
      feedback: result.rows,
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user feedback',
      error: error.message,
    });
  }
};