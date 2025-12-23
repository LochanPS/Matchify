-- Day 60: Remove Skill Level Labels - Complete Removal
-- This migration removes the skill_level column entirely and replaces it with objective metrics
-- Philosophy: Show the journey, not the category

-- Step 1: Backup existing data (optional, for safety)
-- CREATE TABLE users_backup_skill_levels AS SELECT * FROM users;

-- Step 2: Remove skill_level column from users table
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Step 3: Ensure we have the metrics we need for objective comparison
-- These columns should already exist, but verify they're present
ALTER TABLE users ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Step 4: Create a view for player metrics (calculated on-demand)
-- This view provides all the metrics needed for player comparison without storing skill level
CREATE OR REPLACE VIEW player_metrics AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.city,
  u.matches_played,
  u.wins,
  CASE 
    WHEN u.matches_played > 0 THEN ROUND((u.wins::FLOAT / u.matches_played) * 100, 1)
    ELSE 0
  END AS win_rate,
  EXTRACT(DAY FROM NOW() - u.created_at) AS account_age_days,
  EXTRACT(MONTH FROM NOW() - u.created_at) AS account_age_months,
  (SELECT COUNT(*) FROM matches 
   WHERE (player1_id = u.id OR player2_id = u.id) 
   AND DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') AS matches_last_30_days,
  (SELECT MAX(created_at) FROM matches 
   WHERE (player1_id = u.id OR player2_id = u.id)) AS last_match_date,
  u.created_at,
  u.updated_at
FROM users u;

-- Step 5: Create function to calculate win streak
CREATE OR REPLACE FUNCTION get_win_streak(user_id UUID)
RETURNS TABLE(streak_type VARCHAR, streak_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH recent_matches AS (
    SELECT 
      CASE 
        WHEN (m.player1_id = user_id AND m.winner_id = user_id) THEN 'win'
        WHEN (m.player2_id = user_id AND m.winner_id = user_id) THEN 'win'
        ELSE 'loss'
      END AS result,
      m.created_at
    FROM matches m
    WHERE m.player1_id = user_id OR m.player2_id = user_id
    ORDER BY m.created_at DESC
    LIMIT 10
  ),
  streak_groups AS (
    SELECT 
      result,
      ROW_NUMBER() OVER (ORDER BY created_at DESC) - 
      ROW_NUMBER() OVER (PARTITION BY result ORDER BY created_at DESC) AS grp
    FROM recent_matches
  )
  SELECT 
    result::VARCHAR,
    COUNT(*)::INTEGER
  FROM streak_groups
  WHERE grp = 0
  GROUP BY result;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update any API responses that reference skill_level
-- Note: This is handled in the backend code, not in SQL

-- Step 7: Create index for performance on metrics queries
CREATE INDEX IF NOT EXISTS idx_users_matches_played ON users(matches_played);
CREATE INDEX IF NOT EXISTS idx_users_wins ON users(wins);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Step 8: Verify data integrity
-- Check that no users have NULL values for key metrics
UPDATE users SET matches_played = 0 WHERE matches_played IS NULL;
UPDATE users SET wins = 0 WHERE wins IS NULL;

-- Step 9: Add comment explaining the change
COMMENT ON TABLE users IS 'Users table - skill_level removed in favor of objective metrics (matches_played, wins, created_at)';
COMMENT ON COLUMN users.matches_played IS 'Total number of matches played - used for experience indicator';
COMMENT ON COLUMN users.wins IS 'Total number of matches won - used for performance indicator';
COMMENT ON COLUMN users.created_at IS 'Account creation date - used for tenure indicator';

-- Step 10: Log the migration
INSERT INTO migration_log (migration_name, status, executed_at)
VALUES ('060_remove_skill_levels', 'completed', NOW());
