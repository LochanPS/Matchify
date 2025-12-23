const User = require('../models/User');

/**
 * GET /users/:id/profile
 * Get user profile by ID
 */
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const { firebase_uid, ...profile } = user;

    // Calculate win rate and additional stats for players
    if (user.role === 'player') {
      profile.win_rate = user.matches_played > 0
        ? ((user.wins / user.matches_played) * 100).toFixed(1)
        : '0.0';
      
      profile.loss_rate = user.matches_played > 0
        ? ((user.losses / user.matches_played) * 100).toFixed(1)
        : '0.0';

      // Calculate member since date
      if (user.created_at) {
        profile.member_since = new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      }

      // Calculate activity status
      if (user.last_active_date) {
        const daysSinceActive = Math.floor((new Date() - new Date(user.last_active_date)) / (1000 * 60 * 60 * 24));
        if (daysSinceActive <= 7) {
          profile.activity_status = 'Very Active';
        } else if (daysSinceActive <= 30) {
          profile.activity_status = 'Active';
        } else if (daysSinceActive <= 90) {
          profile.activity_status = 'Moderately Active';
        } else {
          profile.activity_status = 'Inactive';
        }
      } else {
        profile.activity_status = 'New Player';
      }
      
      // Get tournament history
      const tournamentHistory = await User.getTournamentHistory(id);
      profile.tournament_history = tournamentHistory;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /users/:id/profile
 * Update user profile (authenticated)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, phone_number, bio, organizer_contact } = req.body;

    // Verify user owns this profile
    if (req.user.user_id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Build updates object
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (city !== undefined) updates.city = city.trim();
    if (phone_number !== undefined) updates.phone_number = phone_number.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    
    // Role-specific updates
    if (req.user.role === 'organizer' && organizer_contact !== undefined) {
      updates.organizer_contact = organizer_contact;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedUser = await User.updateProfile(id, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const { firebase_uid, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /users/:id/stats
 * Get player statistics (public)
 */
exports.getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await User.getPlayerStats(id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
