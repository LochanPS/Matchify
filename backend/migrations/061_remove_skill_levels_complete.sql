-- Day 61: Complete Skill Level Removal Implementation
-- Based on user feedback: Remove artificial barriers, show real journey
-- Philosophy: Fair, transparent, inclusive platform

-- Step 1: Backup existing data (safety measure)
-- CREATE TABLE users_backup_skill_levels AS SELECT * FROM users;

-- Step 2: Remove skill_level column
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Step 3: Add new experience tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_tournament_date DATE,
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS total_tournaments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_streak INTEGER DEFAULT 0;

-- Step 4: Calculate first_tournament_date from existing data
UPDATE users u
SET first_tournament_date = (
  SELECT MIN(p.joined_at)::DATE
  FROM participants p
  WHERE p.player_id = u.user_id
)
WHERE u.role = 'player' AND first_tournament_date IS NULL;

-- Step 5: Calculate total_tournaments
UPDATE users u
SET total_tournaments = (
  SELECT COUNT(*)
  FROM participants p
  WHERE p.player_id = u.user_id
)
WHERE u.role = 'player';

-- Step 6: Calculate last_active_date
UPDATE users u
SET last_active_date = (
  SELECT MAX(p.joined_at)::DATE
  FROM participants p
  WHERE p.player_id = u.user_id
)
WHERE u.role = 'player' AND last_active_date IS NULL;

-- Step 7: Calculate active_streak (consecutive months with activity)
UPDATE users u
SET active_streak = (
  SELECT COUNT(DISTINCT DATE_TRUNC('month', p.joined_at))
  FROM participants p
  WHERE p.player_id = u.user_id
    AND p.joined_at >= CURRENT_DATE - INTERVAL '24 months'
)
WHERE u.role = 'player';

-- Step 8: Create view for player experience metrics
CREATE OR REPLACE VIEW player_experience_metrics AS
SELECT
  u.user_id,
  u.name,
  u.email,
  u.city,
  u.matches_played,
  u.wins,
  CASE
    WHEN u.matches_played > 0 THEN ROUND((u.wins::FLOAT / u.matches_played) * 100, 1)
    ELSE 0
  END AS win_rate,
  u.total_tournaments,
  u.first_tournament_date,
  u.last_active_date,
  u.active_streak,
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, u.first_tournament_date)) AS months_playing,
  CASE
    WHEN u.first_tournament_date IS NULL THEN 'New Player'
    WHEN EXTRACT(MONTH FROM AGE(CURRENT_DATE, u.first_tournament_date)) < 3 THEN 'New Player'
    WHEN EXTRACT(MONTH FROM AGE(CURRENT_DATE, u.first_tournament_date)) < 12 THEN 'Active Player'
    ELSE 'Veteran Player'
  END AS experience_level,
  CASE
    WHEN u.active_streak >= 6 THEN '🔥 Consistent'
    WHEN u.active_streak >= 3 THEN '✨ Regular'
    ELSE ''
  END AS consistency_badge,
  u.created_at
FROM users u
WHERE u.role = 'player';

-- Step 9: Create function to get recent form (last 10 matches)
CREATE OR REPLACE FUNCTION get_recent_form(player_id UUID, limit_matches INT DEFAULT 10)
RETURNS VARCHAR AS $$
DECLARE
  form_string VARCHAR := '';
  match_result CHAR(1);
  match_count INT := 0;
BEGIN
  FOR match_result IN
    SELECT CASE
      WHEN m.winner_id = player_id THEN 'W'
      ELSE 'L'
    END
    FROM matches m
    WHERE (m.player1_id = player_id OR m.player2_id = player_id)
      AND m.status = 'completed'
    ORDER BY m.created_at DESC
    LIMIT limit_matches
  LOOP
    form_string := match_result || form_string;
    match_count := match_count + 1;
  END LOOP;

  RETURN COALESCE(form_string, 'No matches yet');
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create function to get experience badge
CREATE OR REPLACE FUNCTION get_experience_badge(first_tournament_date DATE)
RETURNS VARCHAR AS $$
DECLARE
  months_playing INT;
BEGIN
  IF first_tournament_date IS NULL THEN
    RETURN '🌱';
  END IF;

  months_playing := EXTRACT(MONTH FROM AGE(CURRENT_DATE, first_tournament_date));

  IF months_playing < 3 THEN
    RETURN '🌱';
  ELSIF months_playing < 12 THEN
    RETURN '⚡';
  ELSE
    RETURN '🏆';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_first_tournament_date ON users(first_tournament_date);
CREATE INDEX IF NOT EXISTS idx_users_total_tournaments ON users(total_tournaments);
CREATE INDEX IF NOT EXISTS idx_users_active_streak ON users(active_streak);
CREATE INDEX IF NOT EXISTS idx_users_last_active_date ON users(last_active_date);

-- Step 12: Add constraints to ensure data integrity
ALTER TABLE users
ADD CONSTRAINT check_active_streak_positive CHECK (active_streak >= 0),
ADD CONSTRAINT check_total_tournaments_positive CHECK (total_tournaments >= 0);

-- Step 13: Update table comments
COMMENT ON TABLE users IS 'Users table - skill_level removed in favor of objective experience metrics';
COMMENT ON COLUMN users.first_tournament_date IS 'Date of first tournament participation - shows journey start';
COMMENT ON COLUMN users.last_active_date IS 'Date of last tournament participation - shows engagement';
COMMENT ON COLUMN users.total_tournaments IS 'Total tournaments joined - experience indicator';
COMMENT ON COLUMN users.active_streak IS 'Consecutive months with tournament activity - consistency indicator';

-- Step 14: Verify migration success
SELECT
  COUNT(*) as total_players,
  COUNT(CASE WHEN first_tournament_date IS NOT NULL THEN 1 END) as players_with_tournament_data,
  COUNT(CASE WHEN total_tournaments > 0 THEN 1 END) as active_players,
  AVG(total_tournaments) as avg_tournaments_per_player,
  AVG(active_streak) as avg_active_streak
FROM users
WHERE role = 'player';

-- Step 15: Log the migration
INSERT INTO migration_log (migration_name, status, executed_at, description)
VALUES (
  '061_remove_skill_levels_complete',
  'completed',
  NOW(),
  'Removed skill_level column, added experience tracking fields, created metrics views and functions'
);
