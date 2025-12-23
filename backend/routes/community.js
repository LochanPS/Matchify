const express = require('express');
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { createLimiter } = require('../middleware/security');
const router = express.Router();

// ============ FORUM ROUTES ============

// GET /forums/categories - Get all forum categories
router.get('/forums/categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        fc.*,
        COUNT(ft.topic_id) as topic_count,
        MAX(ft.last_reply_at) as latest_activity
      FROM forum_categories fc
      LEFT JOIN forum_topics ft ON fc.category_id = ft.category_id
      WHERE fc.is_active = true
      GROUP BY fc.category_id
      ORDER BY fc.sort_order, fc.name
    `);
    
    res.json({
      success: true,
      categories: categories.rows
    });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /forums/categories/:categoryId/topics - Get topics in category
router.get('/forums/categories/:categoryId/topics', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const topics = await query(`
      SELECT 
        ft.*,
        u.name as author_name,
        lr.name as last_reply_author_name
      FROM forum_topics ft
      JOIN users u ON ft.user_id = u.user_id
      LEFT JOIN users lr ON ft.last_reply_user_id = lr.user_id
      WHERE ft.category_id = $1
      ORDER BY ft.is_pinned DESC, ft.last_reply_at DESC
      LIMIT $2 OFFSET $3
    `, [categoryId, limit, offset]);
    
    res.json({
      success: true,
      topics: topics.rows
    });
  } catch (error) {
    console.error('Error fetching forum topics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch topics' });
  }
});

// GET /forums/topics/:topicId - Get topic with posts
router.get('/forums/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    
    // Get topic details
    const topicResult = await query(`
      SELECT 
        ft.*,
        u.name as author_name,
        fc.name as category_name
      FROM forum_topics ft
      JOIN users u ON ft.user_id = u.user_id
      JOIN forum_categories fc ON ft.category_id = fc.category_id
      WHERE ft.topic_id = $1
    `, [topicId]);
    
    if (topicResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    
    // Get posts
    const postsResult = await query(`
      SELECT 
        fp.*,
        u.name as author_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.user_id
      WHERE fp.topic_id = $1
      ORDER BY fp.created_at ASC
    `, [topicId]);
    
    // Update view count
    await query(`
      UPDATE forum_topics 
      SET view_count = view_count + 1
      WHERE topic_id = $1
    `, [topicId]);
    
    res.json({
      success: true,
      topic: topicResult.rows[0],
      posts: postsResult.rows
    });
  } catch (error) {
    console.error('Error fetching forum topic:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch topic' });
  }
});

// POST /forums/topics - Create new topic
router.post('/forums/topics', authenticateUser, createLimiter, async (req, res) => {
  try {
    const { category_id, title, content } = req.body;
    const userId = req.user.user_id;
    
    if (!category_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Category, title, and content are required'
      });
    }
    
    const result = await query(`
      INSERT INTO forum_topics (category_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category_id, userId, title, content]);
    
    res.json({
      success: true,
      topic: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating forum topic:', error);
    res.status(500).json({ success: false, message: 'Failed to create topic' });
  }
});

// POST /forums/topics/:topicId/posts - Add post to topic
router.post('/forums/topics/:topicId/posts', authenticateUser, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.user_id;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    const result = await query(`
      INSERT INTO forum_posts (topic_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [topicId, userId, content]);
    
    res.json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// ============ GROUPS ROUTES ============

// GET /groups/discover - Discover groups
router.get('/groups/discover', async (req, res) => {
  try {
    const { city } = req.query;
    
    let whereClause = 'WHERE ug.is_public = true';
    const params = [];
    
    if (city) {
      whereClause += ' AND (ug.group_type = $1 OR ug.group_key = $2)';
      params.push('city', city.toLowerCase());
    }
    
    const groups = await query(`
      SELECT 
        ug.*,
        u.name as creator_name
      FROM user_groups ug
      JOIN users u ON ug.created_by = u.user_id
      ${whereClause}
      ORDER BY ug.member_count DESC, ug.created_at DESC
      LIMIT 20
    `, params);
    
    res.json({
      success: true,
      groups: groups.rows
    });
  } catch (error) {
    console.error('Error discovering groups:', error);
    res.status(500).json({ success: false, message: 'Failed to discover groups' });
  }
});

// GET /groups/my-groups - Get user's groups
router.get('/groups/my-groups', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const groups = await query(`
      SELECT 
        ug.*,
        gm.role,
        gm.joined_at
      FROM user_groups ug
      JOIN group_memberships gm ON ug.group_id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY gm.joined_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      groups: groups.rows
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
});

// POST /groups/:groupId/join - Join a group
router.post('/groups/:groupId/join', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.user_id;
    
    // Check if group exists and is public
    const groupResult = await query(`
      SELECT * FROM user_groups WHERE group_id = $1 AND is_public = true
    `, [groupId]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or not public'
      });
    }
    
    // Join group
    await query(`
      INSERT INTO group_memberships (group_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (group_id, user_id) DO NOTHING
    `, [groupId, userId]);
    
    // Update member count
    await query(`
      UPDATE user_groups 
      SET member_count = (
        SELECT COUNT(*) FROM group_memberships 
        WHERE group_id = $1
      )
      WHERE group_id = $1
    `, [groupId]);
    
    res.json({
      success: true,
      message: 'Successfully joined group'
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ success: false, message: 'Failed to join group' });
  }
});

// ============ EVENTS ROUTES ============

// GET /events - Get community events
router.get('/events', async (req, res) => {
  try {
    const { city, month, year, type } = req.query;
    
    let whereClause = 'WHERE ce.is_public = true AND ce.start_date >= NOW()';
    const params = [];
    let paramCount = 0;
    
    if (city) {
      paramCount++;
      whereClause += ` AND ce.city = $${paramCount}`;
      params.push(city);
    }
    
    if (month && year) {
      paramCount++;
      whereClause += ` AND EXTRACT(MONTH FROM ce.start_date) = $${paramCount}`;
      params.push(parseInt(month));
      paramCount++;
      whereClause += ` AND EXTRACT(YEAR FROM ce.start_date) = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    if (type && type !== 'All') {
      paramCount++;
      whereClause += ` AND ce.event_type = $${paramCount}`;
      params.push(type.toLowerCase());
    }
    
    const events = await query(`
      SELECT 
        ce.*,
        u.name as organizer_name,
        ug.name as group_name
      FROM community_events ce
      JOIN users u ON ce.organizer_id = u.user_id
      LEFT JOIN user_groups ug ON ce.group_id = ug.group_id
      ${whereClause}
      ORDER BY ce.start_date ASC
      LIMIT 50
    `, params);
    
    res.json({
      success: true,
      events: events.rows
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// POST /events - Create new event
router.post('/events', authenticateUser, createLimiter, async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      city,
      max_attendees,
      is_online,
      meeting_link,
      group_id
    } = req.body;
    
    const userId = req.user.user_id;
    
    if (!title || !event_type || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Title, event type, and start date are required'
      });
    }
    
    const result = await query(`
      INSERT INTO community_events (
        title, description, event_type, start_date, end_date,
        location, city, max_attendees, is_online, meeting_link,
        organizer_id, group_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      title, description, event_type, start_date, end_date,
      location, city, max_attendees, is_online, meeting_link,
      userId, group_id
    ]);
    
    res.json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// POST /events/:eventId/rsvp - RSVP to event
router.post('/events/:eventId/rsvp', authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body; // 'going', 'maybe', 'not_going'
    const userId = req.user.user_id;
    
    if (!['going', 'maybe', 'not_going'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RSVP status'
      });
    }
    
    // Check if event exists
    const eventResult = await query(`
      SELECT * FROM community_events WHERE event_id = $1
    `, [eventId]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Update or insert RSVP
    await query(`
      INSERT INTO event_attendees (event_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET status = $3, registered_at = NOW()
    `, [eventId, userId, status]);
    
    res.json({
      success: true,
      message: 'RSVP updated successfully'
    });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(500).json({ success: false, message: 'Failed to update RSVP' });
  }
});

// ============ CHALLENGES ROUTES ============

// GET /challenges - Get active challenges with user progress
router.get('/challenges', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const challenges = await query(`
      SELECT 
        cc.*,
        ucp.current_value,
        ucp.completed_at
      FROM community_challenges cc
      LEFT JOIN user_challenge_progress ucp ON cc.challenge_id = ucp.challenge_id AND ucp.user_id = $1
      WHERE cc.is_active = true AND cc.end_date > NOW()
      ORDER BY cc.end_date ASC
    `, [userId]);
    
    // Get user progress for current month/week
    const progressResult = await query(`
      SELECT 
        COUNT(DISTINCT p.tournament_id) as tournaments_this_month,
        COUNT(CASE WHEN fp.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as forum_helps_this_week
      FROM participants p
      LEFT JOIN forum_posts fp ON fp.user_id = $1
      WHERE p.user_id = $1 
      AND p.created_at >= DATE_TRUNC('month', NOW())
    `, [userId]);
    
    res.json({
      success: true,
      challenges: challenges.rows,
      user_progress: progressResult.rows[0] || {}
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenges' });
  }
});

// ============ COMMUNITY STATS ============

// GET /stats - Get community statistics
router.get('/stats', async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_members,
        (SELECT COUNT(*) FROM forum_posts) as forum_posts,
        (SELECT COUNT(*) FROM community_events WHERE start_date >= DATE_TRUNC('month', NOW())) as events_this_month,
        (SELECT COUNT(*) FROM community_challenges WHERE is_active = true) as active_challenges
    `);
    
    res.json({
      success: true,
      ...statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;