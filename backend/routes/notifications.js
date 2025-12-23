const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { query } = require('../config/database');

// Get user notifications
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, read } = req.query;
    const user_id = req.user.uid;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    const params = [user_id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (read !== undefined) {
      whereClause += ` AND read = $${paramIndex}`;
      params.push(read === 'true');
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    // Get notifications
    const result = await query(
      `SELECT * FROM notifications 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      notifications: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Get unread notification count
router.get('/unread/count', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.uid;

    const result = await query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = $1 AND read = FALSE',
      [user_id]
    );

    res.json({ unread: parseInt(result.rows[0].unread) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;

    const result = await query(
      `UPDATE notifications 
       SET read = TRUE
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read/all', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.uid;

    await query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [user_id]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.uid;

    const result = await query(
      'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2 RETURNING notification_id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification preferences
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.uid;

    let result = await query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [user_id]
    );

    // Create default preferences if not found
    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO notification_preferences (user_id)
         VALUES ($1)
         RETURNING *`,
        [user_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update notification preferences
router.patch('/preferences', authenticateUser, async (req, res) => {
  try {
    const user_id = req.user.uid;
    const {
      email_tournaments,
      email_matches,
      email_payments,
      email_community,
      sms_enabled,
      push_enabled,
    } = req.body;

    // Get current preferences
    let result = await query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [user_id]
    );

    // Create if not exists
    if (result.rows.length === 0) {
      await query(
        `INSERT INTO notification_preferences (user_id)
         VALUES ($1)`,
        [user_id]
      );
    }

    // Update preferences
    const updates = [];
    const values = [user_id];
    let paramIndex = 2;

    if (email_tournaments !== undefined) {
      updates.push(`email_tournaments = $${paramIndex}`);
      values.push(email_tournaments);
      paramIndex++;
    }
    if (email_matches !== undefined) {
      updates.push(`email_matches = $${paramIndex}`);
      values.push(email_matches);
      paramIndex++;
    }
    if (email_payments !== undefined) {
      updates.push(`email_payments = $${paramIndex}`);
      values.push(email_payments);
      paramIndex++;
    }
    if (email_community !== undefined) {
      updates.push(`email_community = $${paramIndex}`);
      values.push(email_community);
      paramIndex++;
    }
    if (sms_enabled !== undefined) {
      updates.push(`sms_enabled = $${paramIndex}`);
      values.push(sms_enabled);
      paramIndex++;
    }
    if (push_enabled !== undefined) {
      updates.push(`push_enabled = $${paramIndex}`);
      values.push(push_enabled);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No preferences to update' });
    }

    updates.push(`updated_at = NOW()`);

    result = await query(
      `UPDATE notification_preferences 
       SET ${updates.join(', ')}
       WHERE user_id = $1
       RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Create notification (internal use)
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = router;
module.exports.createNotification = createNotification;
