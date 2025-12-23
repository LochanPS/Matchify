-- Migration 007: Referral System
-- Day 47: User Growth - Referral System Implementation

-- Referral codes and tracking
CREATE TABLE IF NOT EXISTS referral_codes (
  code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER DEFAULT NULL,
  times_used INTEGER DEFAULT 0
);

-- Referral relationships and rewards
CREATE TABLE IF NOT EXISTS referrals (
  referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  completed_at TIMESTAMP NULL,
  rewarded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(referrer_id, referee_id)
);

-- Referral rewards tracking
CREATE TABLE IF NOT EXISTS referral_rewards (
  reward_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('tournament_credit', 'free_entry', 'premium_features')),
  reward_value DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired')),
  expires_at TIMESTAMP,
  applied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- Social sharing tracking table
CREATE TABLE IF NOT EXISTS social_shares (
  share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  share_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Growth metrics tracking
CREATE TABLE IF NOT EXISTS growth_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,2) DEFAULT 1,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for growth metrics
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_type ON social_shares(content_type);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_type ON growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON growth_metrics(created_at);

-- Tournament invitations table
CREATE TABLE IF NOT EXISTS tournament_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invitee_email VARCHAR(255),
  invitee_phone VARCHAR(20),
  invitation_message TEXT,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'accepted', 'declined')),
  sent_at TIMESTAMP DEFAULT NOW(),
  viewed_at TIMESTAMP NULL,
  responded_at TIMESTAMP NULL
);

-- Indexes for invitations
CREATE INDEX IF NOT EXISTS idx_tournament_invitations_tournament ON tournament_invitations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invitations_inviter ON tournament_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invitations_status ON tournament_invitations(status);

-- Leaderboard cache table for performance
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL,
  leaderboard_key VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  rank INTEGER NOT NULL,
  score DECIMAL(10,2) NOT NULL,
  wins INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(leaderboard_type, leaderboard_key, user_id)
);

-- Indexes for leaderboard cache
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_type_key ON leaderboard_cache(leaderboard_type, leaderboard_key);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank ON leaderboard_cache(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_updated ON leaderboard_cache(updated_at);

-- User achievements table for viral sharing
CREATE TABLE IF NOT EXISTS user_achievements (
  achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  tournament_id UUID,
  achievement_data JSONB,
  is_shared BOOLEAN DEFAULT false,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at);

-- Add referral tracking to users table (only if columns don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_completed_at') THEN
        ALTER TABLE users ADD COLUMN referral_completed_at TIMESTAMP NULL;
    END IF;
END $$;

-- Add growth tracking fields to tournaments table (only if columns don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'share_count') THEN
        ALTER TABLE tournaments ADD COLUMN share_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'invitation_count') THEN
        ALTER TABLE tournaments ADD COLUMN invitation_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to track growth metrics
CREATE OR REPLACE FUNCTION track_growth_metric(
  p_metric_type VARCHAR(50),
  p_metric_value DECIMAL(10,2) DEFAULT 1,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO growth_metrics (metric_type, metric_value, user_id, metadata)
  VALUES (p_metric_type, p_metric_value, p_user_id, p_metadata)
  RETURNING growth_metrics.metric_id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get viral coefficient
CREATE OR REPLACE FUNCTION calculate_viral_coefficient(
  p_timeframe INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS DECIMAL(5,3) AS $$
DECLARE
  invitations_sent INTEGER;
  active_users INTEGER;
  conversion_rate DECIMAL(5,3);
  viral_coefficient DECIMAL(5,3);
BEGIN
  -- Get invitations sent in timeframe
  SELECT COALESCE(COUNT(*), 0) INTO invitations_sent
  FROM tournament_invitations
  WHERE sent_at >= NOW() - p_timeframe;
  
  -- Get active users in timeframe
  SELECT COALESCE(COUNT(DISTINCT user_id), 0) INTO active_users
  FROM growth_metrics
  WHERE created_at >= NOW() - p_timeframe;
  
  -- Calculate conversion rate (invitations that led to signups)
  SELECT 
    CASE 
      WHEN invitations_sent > 0 THEN
        COALESCE(COUNT(DISTINCT u.user_id), 0)::DECIMAL / invitations_sent
      ELSE 0
    END INTO conversion_rate
  FROM users u
  WHERE u.created_at >= NOW() - p_timeframe
  AND u.referred_by IS NOT NULL;
  
  -- Calculate viral coefficient
  IF active_users > 0 THEN
    viral_coefficient := (invitations_sent::DECIMAL / active_users) * conversion_rate;
  ELSE
    viral_coefficient := 0;
  END IF;
  
  RETURN viral_coefficient;
END;
$$ LANGUAGE plpgsql;