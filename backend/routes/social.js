const express = require('express');
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

// POST /social/share - Track social sharing event
router.post('/share', authenticateUser, async (req, res) => {
  try {
    const { content_type, content_id, platform, share_url } = req.body;
    const userId = req.user.user_id;
    
    if (!content_type || !content_id || !platform || !share_url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Insert share record
    await query(`
      INSERT INTO social_shares (user_id, content_type, content_id, platform, share_url)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, content_type, content_id, platform, share_url]);
    
    // Update share count for tournaments
    if (content_type === 'tournament') {
      await query(`
        UPDATE tournaments 
        SET share_count = share_count + 1
        WHERE tournament_id = $1
      `, [content_id]);
    }
    
    // Track growth metric
    await query(`
      SELECT track_growth_metric('share_action', 1, $1, $2)
    `, [userId, JSON.stringify({ content_type, platform })]);
    
    res.json({
      success: true,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track share'
    });
  }
});

// GET /social/shares/stats - Get user's sharing statistics
router.get('/shares/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get sharing statistics
    const statsResult = await query(`
      SELECT 
        content_type,
        platform,
        COUNT(*) as share_count,
        DATE_TRUNC('day', created_at) as share_date
      FROM social_shares 
      WHERE user_id = $1
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY content_type, platform, DATE_TRUNC('day', created_at)
      ORDER BY share_date DESC
    `, [userId]);
    
    // Get total shares by platform
    const platformResult = await query(`
      SELECT 
        platform,
        COUNT(*) as total_shares
      FROM social_shares 
      WHERE user_id = $1
      GROUP BY platform
      ORDER BY total_shares DESC
    `, [userId]);
    
    // Get most shared content
    const contentResult = await query(`
      SELECT 
        ss.content_type,
        ss.content_id,
        COUNT(*) as share_count,
        CASE 
          WHEN ss.content_type = 'tournament' THEN t.name
          ELSE ss.content_id
        END as content_title
      FROM social_shares ss
      LEFT JOIN tournaments t ON ss.content_type = 'tournament' AND ss.content_id = t.tournament_id::text
      WHERE ss.user_id = $1
      GROUP BY ss.content_type, ss.content_id, content_title
      ORDER BY share_count DESC
      LIMIT 5
    `, [userId]);
    
    res.json({
      success: true,
      stats: statsResult.rows,
      platforms: platformResult.rows,
      top_content: contentResult.rows
    });
  } catch (error) {
    console.error('Error getting share stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get share statistics'
    });
  }
});

// POST /tournaments/invite - Send tournament invitations
router.post('/tournaments/invite', authenticateUser, async (req, res) => {
  try {
    const { invitations } = req.body;
    const inviterId = req.user.user_id;
    
    if (!invitations || !Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitations data'
      });
    }
    
    // Validate that all invitations are from the authenticated user
    const invalidInvitations = invitations.filter(inv => inv.inviter_id !== inviterId);
    if (invalidInvitations.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send invitations on behalf of other users'
      });
    }
    
    // Insert invitations
    const insertPromises = invitations.map(invitation => 
      query(`
        INSERT INTO tournament_invitations 
        (tournament_id, inviter_id, invitee_email, invitee_phone, invitation_message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING invitation_id
      `, [
        invitation.tournament_id,
        invitation.inviter_id,
        invitation.invitee_email,
        invitation.invitee_phone,
        invitation.message
      ])
    );
    
    const results = await Promise.all(insertPromises);
    
    // Update invitation count for tournament
    await query(`
      UPDATE tournaments 
      SET invitation_count = invitation_count + $1
      WHERE tournament_id = $2
    `, [invitations.length, invitations[0].tournament_id]);
    
    // Track growth metrics
    await query(`
      SELECT track_growth_metric('tournament_invite', $1, $2, $3)
    `, [
      invitations.length, 
      inviterId, 
      JSON.stringify({ tournament_id: invitations[0].tournament_id })
    ]);
    
    // TODO: Send actual email/SMS invitations here
    // For now, we just track them in the database
    
    res.json({
      success: true,
      message: `${invitations.length} invitations sent successfully`,
      invitation_ids: results.map(r => r.rows[0].invitation_id)
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitations'
    });
  }
});

// GET /tournaments/:tournamentId/invitations - Get tournament invitations (organizer only)
router.get('/tournaments/:tournamentId/invitations', authenticateUser, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Check if user is the tournament organizer
    const tournamentResult = await query(`
      SELECT organizer_id FROM tournaments WHERE tournament_id = $1
    `, [tournamentId]);
    
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    if (tournamentResult.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get invitations for this tournament
    const invitationsResult = await query(`
      SELECT 
        ti.*,
        u.name as inviter_name
      FROM tournament_invitations ti
      JOIN users u ON ti.inviter_id = u.user_id
      WHERE ti.tournament_id = $1
      ORDER BY ti.sent_at DESC
    `, [tournamentId]);
    
    res.json({
      success: true,
      invitations: invitationsResult.rows
    });
  } catch (error) {
    console.error('Error getting tournament invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitations'
    });
  }
});

// GET /leaderboard/city/:city - Get city leaderboard
router.get('/leaderboard/city/:city', authenticateUser, async (req, res) => {
  try {
    const { city } = req.params;
    const { timeframe = 'all' } = req.query;
    const userId = req.user.user_id;
    
    let timeFilter = '';
    if (timeframe === 'week') {
      timeFilter = "AND lc.updated_at >= NOW() - INTERVAL '7 days'";
    } else if (timeframe === 'month') {
      timeFilter = "AND lc.updated_at >= NOW() - INTERVAL '30 days'";
    }
    
    // Get leaderboard from cache
    const leaderboardResult = await query(`
      SELECT 
        lc.*,
        u.name,
        u.user_id
      FROM leaderboard_cache lc
      JOIN users u ON lc.user_id = u.user_id
      WHERE lc.leaderboard_type = 'city' 
      AND lc.leaderboard_key = $1
      ${timeFilter}
      ORDER BY lc.rank ASC
      LIMIT 50
    `, [city]);
    
    // Get current user's rank
    const userRankResult = await query(`
      SELECT rank FROM leaderboard_cache
      WHERE leaderboard_type = 'city' 
      AND leaderboard_key = $1
      AND user_id = $2
      ${timeFilter}
    `, [city, userId]);
    
    const userRank = userRankResult.rows.length > 0 ? userRankResult.rows[0].rank : null;
    
    res.json({
      success: true,
      leaderboard: leaderboardResult.rows,
      user_rank: userRank,
      city: city,
      timeframe: timeframe
    });
  } catch (error) {
    console.error('Error getting city leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
});

// GET /analytics/growth - Get growth analytics (admin/organizer only)
router.get('/analytics/growth', authenticateUser, async (req, res) => {
  try {
    // Check if user has permission to view analytics
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { timeframe = '30d' } = req.query;
    
    let interval;
    switch (timeframe) {
      case '7d':
        interval = '7 days';
        break;
      case '90d':
        interval = '90 days';
        break;
      default:
        interval = '30 days';
    }
    
    // Get new users
    const newUsersResult = await query(`
      SELECT COUNT(*) as new_users
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
    `);
    
    // Get referral rate
    const referralRateResult = await query(`
      SELECT 
        COUNT(CASE WHEN referred_by IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*) * 100 as referral_rate
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
    `);
    
    // Get viral coefficient
    const viralCoefficientResult = await query(`
      SELECT calculate_viral_coefficient(INTERVAL '${interval}') as viral_coefficient
    `);
    
    // Get share rate
    const shareRateResult = await query(`
      SELECT 
        COUNT(DISTINCT ss.user_id)::DECIMAL / COUNT(DISTINCT u.user_id) * 100 as share_rate
      FROM users u
      LEFT JOIN social_shares ss ON u.user_id = ss.user_id 
        AND ss.created_at >= NOW() - INTERVAL '${interval}'
      WHERE u.created_at <= NOW() - INTERVAL '${interval}'
    `);
    
    // Get referral funnel data
    const referralFunnelResult = await query(`
      SELECT 
        COUNT(DISTINCT rc.user_id) as codes_generated,
        COUNT(DISTINCT CASE WHEN rc.times_used > 0 THEN rc.user_id END) as codes_shared,
        COUNT(DISTINCT r.referee_id) as signups_started,
        COUNT(DISTINCT CASE WHEN r.status IN ('completed', 'rewarded') THEN r.referee_id END) as signups_completed,
        COUNT(DISTINCT CASE WHEN u.referral_completed_at IS NOT NULL THEN u.user_id END) as first_tournament
      FROM referral_codes rc
      LEFT JOIN referrals r ON rc.user_id = r.referrer_id
      LEFT JOIN users u ON r.referee_id = u.user_id
      WHERE rc.created_at >= NOW() - INTERVAL '${interval}'
    `);
    
    // Get sharing breakdown
    const sharingBreakdownResult = await query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM social_shares 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY platform
    `);
    
    // Get top shared content
    const topSharedResult = await query(`
      SELECT 
        ss.content_type,
        ss.content_id,
        COUNT(*) as shares,
        CASE 
          WHEN ss.content_type = 'tournament' THEN t.name
          ELSE 'Unknown'
        END as title
      FROM social_shares ss
      LEFT JOIN tournaments t ON ss.content_type = 'tournament' AND ss.content_id = t.tournament_id::text
      WHERE ss.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY ss.content_type, ss.content_id, title
      ORDER BY shares DESC
      LIMIT 5
    `);
    
    // Build sharing breakdown object
    const sharingBreakdown = {};
    sharingBreakdownResult.rows.forEach(row => {
      sharingBreakdown[row.platform] = parseInt(row.count);
    });
    
    res.json({
      success: true,
      new_users: parseInt(newUsersResult.rows[0].new_users),
      referral_rate: parseFloat(referralRateResult.rows[0].referral_rate || 0).toFixed(1),
      viral_coefficient: parseFloat(viralCoefficientResult.rows[0].viral_coefficient || 0).toFixed(3),
      share_rate: parseFloat(shareRateResult.rows[0].share_rate || 0).toFixed(1),
      referral_funnel: referralFunnelResult.rows[0],
      sharing_breakdown: sharingBreakdown,
      top_shared_content: topSharedResult.rows,
      timeframe: timeframe
    });
  } catch (error) {
    console.error('Error getting growth analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get growth analytics'
    });
  }
});

module.exports = router;