const { query } = require('../config/database');
const { validationResult } = require('express-validator');

// Create a new category for a tournament
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { tournamentId } = req.params;
    const {
      category_name,
      match_type,
      entry_fee = 0,
      prize_money_winner = 0,
      prize_money_runner_up = 0,
      max_participants,
      format = 'knockout',
      points_per_game = 21,
      best_of = 1,
    } = req.body;

    // Verify tournament exists and user is the organizer
    const tournamentCheck = await query(
      'SELECT organizer_id FROM tournaments WHERE tournament_id = $1',
      [tournamentId]
    );

    if (tournamentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    if (tournamentCheck.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Only the tournament organizer can create categories',
      });
    }

    // Create the category
    const insertQuery = `
      INSERT INTO categories (
        tournament_id,
        category_name,
        match_type,
        entry_fee,
        prize_money_winner,
        prize_money_runner_up,
        max_participants,
        format,
        points_per_game,
        best_of
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      tournamentId,
      category_name,
      match_type,
      entry_fee,
      prize_money_winner,
      prize_money_runner_up,
      max_participants,
      format,
      points_per_game,
      best_of,
    ]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

// Get all categories for a tournament
exports.getCategoriesByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const selectQuery = `
      SELECT 
        c.*,
        COUNT(cp.registration_id) as current_participants
      FROM categories c
      LEFT JOIN category_participants cp ON c.category_id = cp.category_id 
        AND cp.payment_status = 'paid' 
        AND cp.registration_status = 'confirmed'
      WHERE c.tournament_id = $1
      GROUP BY c.category_id
      ORDER BY c.created_at ASC
    `;

    const result = await query(selectQuery, [tournamentId]);

    res.json({
      success: true,
      categories: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message,
    });
  }
};

// Get a specific category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const selectQuery = `
      SELECT 
        c.*,
        t.name as tournament_name,
        t.date as tournament_date,
        t.venue as tournament_venue,
        COUNT(cp.registration_id) as current_participants
      FROM categories c
      JOIN tournaments t ON c.tournament_id = t.tournament_id
      LEFT JOIN category_participants cp ON c.category_id = cp.category_id 
        AND cp.payment_status = 'paid' 
        AND cp.registration_status = 'confirmed'
      WHERE c.category_id = $1
      GROUP BY c.category_id, t.tournament_id
    `;

    const result = await query(selectQuery, [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message,
    });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { categoryId } = req.params;
    const updateFields = req.body;

    // Check if category exists and user is organizer
    const categoryCheck = await query(`
      SELECT c.*, t.organizer_id
      FROM categories c
      JOIN tournaments t ON c.tournament_id = t.tournament_id
      WHERE c.category_id = $1
    `, [categoryId]);

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (categoryCheck.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Only the tournament organizer can update categories',
      });
    }

    // Check if there are paid registrations (some fields become locked)
    const registrationCheck = await query(`
      SELECT COUNT(*) as paid_count
      FROM category_participants
      WHERE category_id = $1 AND payment_status = 'paid'
    `, [categoryId]);

    const hasPaidRegistrations = parseInt(registrationCheck.rows[0].paid_count) > 0;

    // Fields that cannot be changed after paid registrations
    const lockedFields = ['entry_fee', 'match_type', 'format'];
    
    if (hasPaidRegistrations) {
      for (const field of lockedFields) {
        if (updateFields.hasOwnProperty(field)) {
          return res.status(400).json({
            success: false,
            message: `Cannot change ${field} after players have paid`,
          });
        }
      }

      // Max participants can only be increased
      if (updateFields.max_participants && 
          updateFields.max_participants < categoryCheck.rows[0].max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Cannot decrease max participants after players have paid',
        });
      }
    }

    // Build update query dynamically
    const allowedFields = [
      'category_name', 'prize_money_winner', 'prize_money_runner_up',
      'max_participants', 'points_per_game', 'best_of'
    ];

    if (!hasPaidRegistrations) {
      allowedFields.push(...lockedFields);
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(categoryId);

    const updateQuery = `
      UPDATE categories 
      SET ${updates.join(', ')}
      WHERE category_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists and user is organizer
    const categoryCheck = await query(`
      SELECT c.*, t.organizer_id
      FROM categories c
      JOIN tournaments t ON c.tournament_id = t.tournament_id
      WHERE c.category_id = $1
    `, [categoryId]);

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (categoryCheck.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Only the tournament organizer can delete categories',
      });
    }

    // Check if there are any registrations
    const registrationCheck = await query(`
      SELECT COUNT(*) as count
      FROM category_participants
      WHERE category_id = $1
    `, [categoryId]);

    if (parseInt(registrationCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing registrations',
      });
    }

    // Delete the category
    await query('DELETE FROM categories WHERE category_id = $1', [categoryId]);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};

// Register a player for a category
exports.registerForCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { categoryId } = req.params;
    const {
      player_id,
      partner_id,
      partner_name,
      partner_email,
      partner_phone,
    } = req.body;

    // Verify category exists
    const categoryResult = await query(`
      SELECT c.*, t.name as tournament_name, t.date as tournament_date
      FROM categories c
      JOIN tournaments t ON c.tournament_id = t.tournament_id
      WHERE c.category_id = $1
    `, [categoryId]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const category = categoryResult.rows[0];

    // Check if category is full
    const participantCount = await query(`
      SELECT COUNT(*) as count
      FROM category_participants
      WHERE category_id = $1 AND payment_status = 'paid' AND registration_status = 'confirmed'
    `, [categoryId]);

    if (parseInt(participantCount.rows[0].count) >= category.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Category is full',
      });
    }

    // Check if player is already registered
    const existingRegistration = await query(`
      SELECT registration_id
      FROM category_participants
      WHERE category_id = $1 AND player_id = $2
    `, [categoryId, player_id]);

    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Player is already registered for this category',
      });
    }

    // For doubles, validate partner information
    if (category.match_type === 'doubles' || category.match_type === 'mixed_doubles') {
      if (!partner_id && !partner_name) {
        return res.status(400).json({
          success: false,
          message: 'Partner information is required for doubles categories',
        });
      }
    }

    // Create registration record
    const insertQuery = `
      INSERT INTO category_participants (
        category_id,
        player_id,
        partner_id,
        partner_name,
        partner_email,
        partner_phone,
        payment_amount,
        payment_status,
        registration_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      categoryId,
      player_id,
      partner_id,
      partner_name,
      partner_email,
      partner_phone,
      category.entry_fee,
      'pending', // Will be updated after payment
      'registered',
    ]);

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      registration: result.rows[0],
      category: category,
    });
  } catch (error) {
    console.error('Register for category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for category',
      error: error.message,
    });
  }
};

// Get participants for a category
exports.getCategoryParticipants = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const selectQuery = `
      SELECT 
        cp.*,
        u.name as player_name,
        u.email as player_email,
        partner.name as partner_user_name
      FROM category_participants cp
      JOIN users u ON cp.player_id = u.user_id
      LEFT JOIN users partner ON cp.partner_id = partner.user_id
      WHERE cp.category_id = $1
      ORDER BY cp.registered_at ASC
    `;

    const result = await query(selectQuery, [categoryId]);

    res.json({
      success: true,
      participants: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Get category participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category participants',
      error: error.message,
    });
  }
};

// Leave a category (cancel registration)
exports.leaveCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { player_id } = req.body;

    // Check if registration exists
    const registrationResult = await query(`
      SELECT * FROM category_participants
      WHERE category_id = $1 AND player_id = $2
    `, [categoryId, player_id]);

    if (registrationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const registration = registrationResult.rows[0];

    // Check if matches have been generated
    const matchCheck = await query(`
      SELECT COUNT(*) as count
      FROM matches
      WHERE category_id = $1 AND (player1_id = $2 OR player2_id = $2)
    `, [categoryId, player_id]);

    if (parseInt(matchCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave category after matches have been generated',
      });
    }

    // Update registration status to cancelled
    await query(`
      UPDATE category_participants
      SET registration_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE category_id = $1 AND player_id = $2
    `, [categoryId, player_id]);

    res.json({
      success: true,
      message: 'Successfully left the category',
    });
  } catch (error) {
    console.error('Leave category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave category',
      error: error.message,
    });
  }
};