const express = require('express');
const router = express.Router();
const { authenticateUser, requireOrganizer } = require('../middleware/auth');
const { query } = require('../config/database');

// Get all public templates + user's templates
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const organizer_id = req.user.uid;

    // Get public templates + user's templates
    const result = await query(
      `SELECT * FROM tournament_templates 
       WHERE is_public = TRUE OR organizer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [organizer_id, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM tournament_templates 
       WHERE is_public = TRUE OR organizer_id = $1`,
      [organizer_id]
    );

    res.json({
      templates: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Get template by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM tournament_templates WHERE template_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Create template
router.post('/', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const organizer_id = req.user.uid;
    const {
      template_name,
      description,
      match_type,
      format,
      max_players,
      entry_fee = 0,
      prize_money = 0,
      is_public = false,
    } = req.body;

    // Validate required fields
    if (!template_name || !match_type || !format || !max_players) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO tournament_templates 
       (organizer_id, template_name, description, match_type, format, max_players, entry_fee, prize_money, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [organizer_id, template_name, description, match_type, format, max_players, entry_fee, prize_money, is_public]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.patch('/:id', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.uid;
    const {
      template_name,
      description,
      match_type,
      format,
      max_players,
      entry_fee,
      prize_money,
      is_public,
    } = req.body;

    // Verify ownership
    const templateResult = await query(
      'SELECT organizer_id FROM tournament_templates WHERE template_id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (templateResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build update query
    const updates = [];
    const values = [id];
    let paramIndex = 2;

    if (template_name !== undefined) {
      updates.push(`template_name = $${paramIndex}`);
      values.push(template_name);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (match_type !== undefined) {
      updates.push(`match_type = $${paramIndex}`);
      values.push(match_type);
      paramIndex++;
    }
    if (format !== undefined) {
      updates.push(`format = $${paramIndex}`);
      values.push(format);
      paramIndex++;
    }
    if (max_players !== undefined) {
      updates.push(`max_players = $${paramIndex}`);
      values.push(max_players);
      paramIndex++;
    }
    if (entry_fee !== undefined) {
      updates.push(`entry_fee = $${paramIndex}`);
      values.push(entry_fee);
      paramIndex++;
    }
    if (prize_money !== undefined) {
      updates.push(`prize_money = $${paramIndex}`);
      values.push(prize_money);
      paramIndex++;
    }
    if (is_public !== undefined) {
      updates.push(`is_public = $${paramIndex}`);
      values.push(is_public);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE tournament_templates SET ${updates.join(', ')} WHERE template_id = $1 RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.uid;

    // Verify ownership
    const templateResult = await query(
      'SELECT organizer_id FROM tournament_templates WHERE template_id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (templateResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await query('DELETE FROM tournament_templates WHERE template_id = $1', [id]);

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Duplicate template
router.post('/:id/duplicate', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.uid;

    // Get template
    const templateResult = await query(
      'SELECT * FROM tournament_templates WHERE template_id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Create duplicate
    const result = await query(
      `INSERT INTO tournament_templates 
       (organizer_id, template_name, description, match_type, format, max_players, entry_fee, prize_money, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        organizer_id,
        `${template.template_name} (Copy)`,
        template.description,
        template.match_type,
        template.format,
        template.max_players,
        template.entry_fee,
        template.prize_money,
        false, // New copies are private by default
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// Quick create tournament from template
router.post('/:id/quick-create', authenticateUser, requireOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.uid;
    const {
      tournament_name,
      venue_address,
      tournament_date,
      entry_fee,
      prize_money,
    } = req.body;

    // Validate required fields
    if (!tournament_name || !venue_address || !tournament_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get template
    const templateResult = await query(
      'SELECT * FROM tournament_templates WHERE template_id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Create tournament from template
    const tournamentResult = await query(
      `INSERT INTO tournaments 
       (organizer_id, tournament_name, venue, tournament_date, match_type, format, max_players, entry_fee, prize_money)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        organizer_id,
        tournament_name,
        venue_address,
        tournament_date,
        template.match_type,
        template.format,
        template.max_players,
        entry_fee || template.entry_fee,
        prize_money || template.prize_money,
      ]
    );

    const tournament = tournamentResult.rows[0];

    // Track usage
    await query(
      `INSERT INTO template_usage (template_id, organizer_id, tournament_id)
       VALUES ($1, $2, $3)`,
      [id, organizer_id, tournament.tournament_id]
    );

    // Increment usage count
    await query(
      'UPDATE tournament_templates SET usage_count = usage_count + 1 WHERE template_id = $1',
      [id]
    );

    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error creating tournament from template:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

module.exports = router;
