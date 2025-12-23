const express = require('express');
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { createLimiter } = require('../middleware/security');
const router = express.Router();

// Generate unique referral codes
const generateReferralCode = (userName) => {
  const prefix = userName.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
};

// Create referral code for user
const createReferralCode = async (userId, userName) => {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const code = generateReferralCode(userName);
    
    try {
      const result = await query(`
        INSERT INTO referral_codes (user_id, referral_code)
        VALUES ($1, $2)
        RETURNING *
      `, [userId, code]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        attempts++;
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Failed to generate unique referral code');
};

// Referral reward configuration
const REFERRAL_REWARDS = {
  REFERRER: {
    type: 'tournament_credit',
    value: 100, // ₹100 credit
    description: 'Tournament entry credit'
  },
  REFEREE: {
    type: 'free_entry',
    value: 1, // 1 free tournament entry
    description: 'Free tournament entry'
  }
};

// Process referral completion
const processReferralCompletion = async (refereeId) => {
  try {
    // Find pending referral
    const referralResult = await query(`
      SELECT r.*, u.name as referrer_name
      FROM referrals r
      JOIN users u ON r.referrer_id = u.user_id
      WHERE r.referee_id = $1 AND r.status = 'pending'
    `, [refereeId]);
    
    if (referralResult.rows.length === 0) return;
    
    const referral = referralResult.rows[0];
    
    // Mark referral as completed
    await query(`
      UPDATE referrals 
      SET status = 'completed', completed_at = NOW()
      WHERE referral_id = $1
    `, [referral.referral_id]);
    
    // Create rewards for both users
    await Promise.all([
      // Reward for referrer
      query(`
        INSERT INTO referral_rewards (referral_id, user_id, reward_type, reward_value, expires_at)
        VALUES ($1, $2, $3, $4, NOW() + INTERVAL '90 days')
      `, [
        referral.referral_id,
        referral.referrer_id,
        REFERRAL_REWARDS.REFERRER.type,
        REFERRAL_REWARDS.REFERRER.value
      ]),
      
      // Reward for referee
      query(`
        INSERT INTO referral_rewards (referral_id, user_id, reward_type, reward_value, expires_at)
        VALUES ($1, $2, $3, $4, NOW() + INTERVAL '90 days')
      `, [
        referral.referral_id,
        referral.referee_id,
        REFERRAL_REWARDS.REFEREE.type,
        REFERRAL_REWARDS.REFEREE.value
      ])
    ]);
    
    console.log(`Referral completed: ${referral.referrer_name} → ${refereeId}`);
  } catch (error) {
    console.error('Error processing referral completion:', error);
  }
};

// GET /referrals/my-code - Get user's referral code
router.get('/my-code', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Check if user already has a referral code
    let result = await query(`
      SELECT * FROM referral_codes 
      WHERE user_id = $1 AND is_active = true
    `, [userId]);
    
    if (result.rows.length === 0) {
      // Create new referral code
      const newCode = await createReferralCode(userId, req.user.name);
      result.rows = [newCode];
    }
    
    const referralCode = result.rows[0];
    
    // Get referral statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'rewarded' THEN 1 END) as rewarded_referrals
      FROM referrals 
      WHERE referrer_id = $1
    `, [userId]);
    
    res.json({
      success: true,
      referral_code: referralCode.referral_code,
      statistics: statsResult.rows[0],
      share_url: `${process.env.FRONTEND_URL}/signup?ref=${referralCode.referral_code}`
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code'
    });
  }
});

// GET /referrals/stats - Get detailed referral statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get referral statistics
    const statsResult = await query(`
      SELECT 
        r.*,
        u.name as referee_name,
        u.email as referee_email,
        u.created_at as referee_joined_at
      FROM referrals r
      JOIN users u ON r.referee_id = u.user_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    
    // Get reward statistics
    const rewardsResult = await query(`
      SELECT 
        reward_type,
        SUM(reward_value) as total_value,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) as applied_count
      FROM referral_rewards 
      WHERE user_id = $1
      GROUP BY reward_type
    `, [userId]);
    
    res.json({
      success: true,
      referrals: statsResult.rows,
      rewards: rewardsResult.rows
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics'
    });
  }
});

// POST /referrals/validate - Validate referral code during signup
router.post('/validate', async (req, res) => {
  try {
    const { referral_code } = req.body;
    
    if (!referral_code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }
    
    // Check if referral code exists and is active
    const result = await query(`
      SELECT rc.*, u.name as referrer_name
      FROM referral_codes rc
      JOIN users u ON rc.user_id = u.user_id
      WHERE rc.referral_code = $1 AND rc.is_active = true
      AND (rc.expires_at IS NULL OR rc.expires_at > NOW())
      AND (rc.usage_limit IS NULL OR rc.times_used < rc.usage_limit)
    `, [referral_code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired referral code'
      });
    }
    
    const referralCodeData = result.rows[0];
    
    res.json({
      success: true,
      valid: true,
      referrer_name: referralCodeData.referrer_name,
      rewards: {
        referrer: REFERRAL_REWARDS.REFERRER,
        referee: REFERRAL_REWARDS.REFEREE
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code'
    });
  }
});

// POST /referrals/apply - Apply referral code during signup
router.post('/apply', async (req, res) => {
  try {
    const { referral_code, referee_id } = req.body;
    
    if (!referral_code || !referee_id) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and referee ID are required'
      });
    }
    
    // Get referral code details
    const codeResult = await query(`
      SELECT * FROM referral_codes 
      WHERE referral_code = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (usage_limit IS NULL OR times_used < usage_limit)
    `, [referral_code]);
    
    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired referral code'
      });
    }
    
    const referralCodeData = codeResult.rows[0];
    
    // Check if user is trying to refer themselves
    if (referralCodeData.user_id === referee_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use your own referral code'
      });
    }
    
    // Check if referral already exists
    const existingResult = await query(`
      SELECT * FROM referrals 
      WHERE referrer_id = $1 AND referee_id = $2
    `, [referralCodeData.user_id, referee_id]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Referral already exists'
      });
    }
    
    // Create referral record
    await query(`
      INSERT INTO referrals (referrer_id, referee_id, referral_code, status)
      VALUES ($1, $2, $3, 'pending')
    `, [referralCodeData.user_id, referee_id, referral_code]);
    
    // Update referral code usage count
    await query(`
      UPDATE referral_codes 
      SET times_used = times_used + 1
      WHERE code_id = $1
    `, [referralCodeData.code_id]);
    
    res.json({
      success: true,
      message: 'Referral applied successfully'
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral'
    });
  }
});

// POST /referrals/complete - Complete referral (called when referee completes first tournament)
router.post('/complete', authenticateUser, async (req, res) => {
  try {
    const { referee_id } = req.body;
    
    if (!referee_id) {
      return res.status(400).json({
        success: false,
        message: 'Referee ID is required'
      });
    }
    
    await processReferralCompletion(referee_id);
    
    res.json({
      success: true,
      message: 'Referral completion processed'
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete referral'
    });
  }
});

// GET /referrals/rewards - Get user's referral rewards
router.get('/rewards', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await query(`
      SELECT 
        rr.*,
        r.referrer_id,
        r.referee_id,
        u.name as related_user_name
      FROM referral_rewards rr
      JOIN referrals r ON rr.referral_id = r.referral_id
      LEFT JOIN users u ON (
        CASE 
          WHEN rr.user_id = r.referrer_id THEN r.referee_id
          ELSE r.referrer_id
        END
      ) = u.user_id
      WHERE rr.user_id = $1
      ORDER BY rr.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      rewards: result.rows
    });
  } catch (error) {
    console.error('Error getting referral rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral rewards'
    });
  }
});

// POST /referrals/rewards/:rewardId/apply - Apply a referral reward
router.post('/rewards/:rewardId/apply', authenticateUser, async (req, res) => {
  try {
    const { rewardId } = req.params;
    const userId = req.user.user_id;
    
    // Get reward details
    const rewardResult = await query(`
      SELECT * FROM referral_rewards 
      WHERE reward_id = $1 AND user_id = $2 AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > NOW())
    `, [rewardId, userId]);
    
    if (rewardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or already applied'
      });
    }
    
    const reward = rewardResult.rows[0];
    
    // Apply the reward based on type
    if (reward.reward_type === 'tournament_credit') {
      // Add credit to user's account (implement wallet system)
      // For now, just mark as applied
      await query(`
        UPDATE referral_rewards 
        SET status = 'applied', applied_at = NOW()
        WHERE reward_id = $1
      `, [rewardId]);
    } else if (reward.reward_type === 'free_entry') {
      // Add free entry to user's account
      await query(`
        UPDATE referral_rewards 
        SET status = 'applied', applied_at = NOW()
        WHERE reward_id = $1
      `, [rewardId]);
    }
    
    res.json({
      success: true,
      message: 'Reward applied successfully',
      reward: {
        type: reward.reward_type,
        value: reward.reward_value,
        description: reward.reward_type === 'tournament_credit' 
          ? `₹${reward.reward_value} tournament credit` 
          : `${reward.reward_value} free tournament entry`
      }
    });
  } catch (error) {
    console.error('Error applying reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply reward'
    });
  }
});

module.exports = { router, processReferralCompletion };