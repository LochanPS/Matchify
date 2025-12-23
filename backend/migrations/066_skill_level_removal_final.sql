-- Day 66: Complete Skill Level Removal & Player Stats Redesign
-- Removes all skill-level references and adds comprehensive player statistics
-- Integrates with existing Matchify Credits system

-- Step 1: Remove skill_level column from users table
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Step 2: Add new player tracking fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_tournaments_joined INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_matches_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_tournament_date DATE NULL,
ADD COLUMN IF NOT EXISTS last_active_date DATE NULL;

-- Step 3: Create player_stats table for detailed analytics
CREATE TABLE IF NOT EXISTS player_stats (
  stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES users(user_id) UNIQUE NOT NULL,
  
  -- Match Performance
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Tournament Performance
  tournaments_joined INTEGER DEFAULT 0,
  tournaments_completed INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  runner_up_finishes INTEGER DEFAULT 0,
  semifinal_finishes INTEGER DEFAULT 0,
  
  -- Recent Form (Last 10 Matches)
  recent_wins INTEGER DEFAULT 0,
  recent_losses INTEGER DEFAULT 0,
  recent_form VARCHAR(20) NULL,
  
  -- Streaks
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  current_loss_streak INTEGER DEFAULT 0,
  
  -- Consistency Metrics
  avg_matches_per_tournament DECIMAL(5,2) DEFAULT 0.00,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Time-Based Activity
  active_months INTEGER DEFAULT 0,
  tournaments_per_month DECIMAL(5,2) DEFAULT 0.00,
  
  -- Last Updated
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_player_id (player_id),
  INDEX idx_win_percentage (win_percentage),
  INDEX idx_tournaments_completed (tournaments_completed)
);

-- Step 4: Populate player_stats from existing data
INSERT INTO player_stats (
  player_id, total_matches, wins, losses
)
SELECT 
  user_id, 
  COALESCE(matches_played, 0),
  COALESCE(wins, 0),
  COALESCE(matches_played - wins, 0)
FROM users
WHERE role = 'player'
ON CONFLICT (player_id) DO NOTHING;

-- Step 5: Calculate win percentages
UPDATE player_stats
SET win_percentage = CASE 
  WHEN total_matches > 0 THEN ROUND((wins * 100.0 / total_matches)::numeric, 2)
  ELSE 0.00
END;

-- Step 6: Remove skill-level based tournament filters (if they exist)
DELETE FROM user_preferences 
WHERE preference_key = 'skill_level_filter';

-- Step 7: Create view for player experience metrics (without skill labels)
CREATE OR REPLACE VIEW player_experience_view AS
SELECT
  u.user_id,
  u.name,
  u.email,
  u.city,
  u.first_tournament_date,
  u.last_active_date,
  ps.total_matches,
  ps.wins,
  ps.losses,
  ps.win_percentage,
  ps.tournaments_joined,
  ps.tournaments_completed,
  ps.tournaments_won,
  ps.longest_win_streak,
  ps.current_win_streak,
  ps.completion_rate,
  ps.active_months,
  CASE
    WHEN ps.tournaments_completed = 0 THEN 'New Player'
    WHEN ps.tournaments_completed BETWEEN 1 AND 5 THEN 'Getting Started'
    WHEN ps.tournaments_completed BETWEEN 6 AND 15 THEN 'Active Player'
    WHEN ps.tournaments_completed > 15 THEN 'Veteran Player'
  END AS experience_segment,
  CASE
    WHEN ps.longest_win_streak >= 5 THEN '🔥 On Fire'
    WHEN ps.current_win_streak >= 3 THEN '⚡ Hot Streak'
    WHEN ps.win_percentage >= 60 THEN '✨ Strong Form'
    ELSE '📈 Building'
  END AS current_form_badge,
  u.created_at
FROM users u
LEFT JOIN player_stats ps ON u.user_id = ps.player_id
WHERE u.role = 'player';

-- Step 8: Create function to update player stats
CREATE OR REPLACE FUNCTION update_player_stats(p_player_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE player_stats
  SET
    total_matches = (
      SELECT COUNT(*) FROM matches 
      WHERE (player1_id = p_player_id OR player2_id = p_player_id)
      AND status = 'completed'
    ),
    wins = (
      SELECT COUNT(*) FROM matches 
      WHERE winner_id = p_player_id AND status = 'completed'
    ),
    losses = (
      SELECT COUNT(*) FROM matches 
      WHERE (player1_id = p_player_id OR player2_id = p_player_id)
      AND winner_id != p_player_id AND status = 'completed'
    ),
    win_percentage = CASE
      WHEN (SELECT COUNT(*) FROM matches 
            WHERE (player1_id = p_player_id OR player2_id = p_player_id)
            AND status = 'completed') > 0
      THEN ROUND(
        (SELECT COUNT(*) FROM matches WHERE winner_id = p_player_id AND status = 'completed')::numeric * 100 /
        (SELECT COUNT(*) FROM matches WHERE (player1_id = p_player_id OR player2_id = p_player_id) AND status = 'completed')::numeric,
        2
      )
      ELSE 0.00
    END,
    tournaments_joined = (
      SELECT COUNT(*) FROM participants 
      WHERE player_id = p_player_id
    ),
    tournaments_completed = (
      SELECT COUNT(DISTINCT t.tournament_id) FROM participants p
      JOIN tournaments t ON p.tournament_id = t.tournament_id
      WHERE p.player_id = p_player_id AND t.status = 'completed'
    ),
    updated_at = NOW()
  WHERE player_id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to update stats when match is completed
CREATE OR REPLACE FUNCTION trigger_update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM update_player_stats(NEW.player1_id);
    PERFORM update_player_stats(NEW.player2_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_match_complete ON matches;
CREATE TRIGGER update_stats_on_match_complete
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_update_player_stats();

-- Step 10: Remove any skill-level based tournament constraints
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS check_skill_level;

-- Step 11: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_first_tournament_date ON users(first_tournament_date);
CREATE INDEX IF NOT EXISTS idx_users_last_active_date ON users(last_active_date);
CREATE INDEX IF NOT EXISTS idx_player_stats_win_percentage ON player_stats(win_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_tournaments_completed ON player_stats(tournaments_completed DESC);

-- Step 12: Update user comments
COMMENT ON TABLE users IS 'Users table - skill_level removed, replaced with objective statistics';
COMMENT ON COLUMN users.total_tournaments_joined IS 'Total tournaments player has joined';
COMMENT ON COLUMN users.total_matches_played IS 'Total matches player has participated in';
COMMENT ON COLUMN users.total_wins IS 'Total matches won';
COMMENT ON COLUMN users.first_tournament_date IS 'Date of first tournament participation';
COMMENT ON COLUMN users.last_active_date IS 'Date of last tournament participation';

-- Step 13: Verify migration success
SELECT
  COUNT(*) as total_players,
  COUNT(CASE WHEN first_tournament_date IS NOT NULL THEN 1 END) as players_with_tournament_data,
  COUNT(CASE WHEN total_tournaments_joined > 0 THEN 1 END) as active_players,
  AVG(total_tournaments_joined) as avg_tournaments_per_player,
  AVG(total_wins) as avg_wins_per_player
FROM users
WHERE role = 'player';

-- Step 14: Log the migration
INSERT INTO migration_log (migration_name, status, executed_at, description)
VALUES (
  '066_skill_level_removal_final',
  'completed',
  NOW(),
  'Complete skill level removal with player stats redesign and Credits system integration'
);
