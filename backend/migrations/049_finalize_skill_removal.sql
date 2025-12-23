-- Day 49: Finalize Skill Level Removal - Critical Product Redesign
-- This migration ensures complete removal of skill-level classifications
-- and verifies the journey-based system is properly implemented

-- ============================================================================
-- STEP 1: Verify skill_level column removal
-- ============================================================================

-- Ensure skill_level column is completely removed
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Remove skill_level enum type if it exists
DROP TYPE IF EXISTS skill_level CASCADE;

-- ============================================================================
-- STEP 2: Ensure all journey-based fields exist
-- ============================================================================

-- Add journey-based fields if they don't exist (from migration 037)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_tournament_date DATE NULL,
ADD COLUMN IF NOT EXISTS last_active_date DATE NULL,
ADD COLUMN IF NOT EXISTS total_tournaments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;

-- ============================================================================
-- STEP 3: Update player journey view (ensure it exists)
-- ============================================================================

-- Create or replace the player journey view
CREATE OR REPLACE VIEW player_journey AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.city,
    u.matches_played,
    u.wins,
    u.losses,
    CASE 
        WHEN u.matches_played = 0 THEN 0
        ELSE ROUND((u.wins::DECIMAL / u.matches_played) * 100, 1)
    END as win_rate,
    u.total_tournaments,
    u.tournaments_won,
    u.first_tournament_date,
    u.last_active_date,
    u.activity_streak,
    u.current_streak,
    u.best_streak,
    -- Experience level (objective, non-judgmental)
    CASE 
        WHEN u.matches_played = 0 THEN 'New to tournaments'
        WHEN u.matches_played < 5 THEN 'Getting started'
        WHEN u.matches_played < 20 THEN 'Active player'
        WHEN u.matches_played < 50 THEN 'Tournament regular'
        ELSE 'Veteran player'
    END as experience_level,
    -- Activity status
    CASE 
        WHEN u.last_active_date IS NULL THEN 'Never played'
        WHEN u.last_active_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Recently active'
        WHEN u.last_active_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Moderately active'
        ELSE 'Inactive'
    END as activity_status
FROM users u
WHERE u.role = 'player';

-- ============================================================================
-- STEP 4: Backfill journey data for existing users
-- ============================================================================

-- Calculate first_tournament_date for users who don't have it
UPDATE users 
SET first_tournament_date = (
    SELECT MIN(joined_at)::DATE
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player' 
AND first_tournament_date IS NULL
AND EXISTS (
    SELECT 1 FROM participants WHERE participants.player_id = users.user_id
);

-- Calculate last_active_date for users who don't have it
UPDATE users 
SET last_active_date = (
    SELECT MAX(joined_at)::DATE
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player' 
AND last_active_date IS NULL
AND EXISTS (
    SELECT 1 FROM participants WHERE participants.player_id = users.user_id
);

-- Calculate total_tournaments for users who don't have it
UPDATE users 
SET total_tournaments = (
    SELECT COUNT(DISTINCT tournament_id)
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player'
AND total_tournaments = 0
AND EXISTS (
    SELECT 1 FROM participants WHERE participants.player_id = users.user_id
);

-- Calculate losses from matches (total matches - wins) for users who don't have it
UPDATE users 
SET losses = GREATEST(0, matches_played - wins)
WHERE role = 'player' 
AND losses = 0 
AND matches_played > wins;

-- ============================================================================
-- STEP 5: Remove any remaining skill-based constraints
-- ============================================================================

-- Remove old skill-based check constraints if they exist
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_player_profile;

-- Add new role-based constraint (without skill_level)
ALTER TABLE users 
ADD CONSTRAINT valid_user_profile CHECK (
    (role = 'player' AND organizer_contact IS NULL) OR
    (role = 'organizer' AND organizer_contact IS NOT NULL)
);

-- Ensure wins don't exceed matches played
ALTER TABLE users 
ADD CONSTRAINT wins_not_exceed_matches CHECK (wins <= matches_played);

-- ============================================================================
-- STEP 6: Create indexes for journey-based queries
-- ============================================================================

-- Indexes for new journey fields (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_first_tournament_date ON users(first_tournament_date);
CREATE INDEX IF NOT EXISTS idx_users_last_active_date ON users(last_active_date);
CREATE INDEX IF NOT EXISTS idx_users_total_tournaments ON users(total_tournaments);
CREATE INDEX IF NOT EXISTS idx_users_matches_played ON users(matches_played);
CREATE INDEX IF NOT EXISTS idx_users_wins ON users(wins);
CREATE INDEX IF NOT EXISTS idx_users_losses ON users(losses);
CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak);

-- ============================================================================
-- STEP 7: Verify data integrity
-- ============================================================================

-- Check that no users have skill_level data
DO $$
BEGIN
    -- This will fail if skill_level column still exists
    IF EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'skill_level'
    ) THEN
        RAISE EXCEPTION 'skill_level column still exists in users table';
    END IF;
    
    -- Check that journey data is consistent
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE role = 'player' 
        AND wins > matches_played
    ) THEN
        RAISE EXCEPTION 'Data integrity issue: wins exceed matches_played for some users';
    END IF;
    
    RAISE NOTICE 'Day 49 migration validation passed: skill_level system completely removed';
END $$;

-- ============================================================================
-- STEP 8: Log migration completion
-- ============================================================================

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    migration_name VARCHAR(255) PRIMARY KEY,
    executed_at TIMESTAMP NOT NULL,
    description TEXT
);

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES (
    '049_finalize_skill_removal',
    CURRENT_TIMESTAMP,
    'Day 49: Complete finalization of skill level removal and journey-based system implementation. Critical product redesign complete.'
) ON CONFLICT (migration_name) DO UPDATE SET 
    executed_at = CURRENT_TIMESTAMP,
    description = EXCLUDED.description;

-- ============================================================================
-- MIGRATION COMPLETE - SKILL LEVEL SYSTEM FULLY REMOVED
-- ============================================================================

-- Summary of changes:
-- ✅ skill_level column completely removed from users table
-- ✅ skill_level enum type removed
-- ✅ Journey-based fields added and populated
-- ✅ Player journey view created for objective experience levels
-- ✅ Constraints updated to remove skill-based validation
-- ✅ Indexes created for performance on journey queries
-- ✅ Data integrity verified

COMMENT ON VIEW player_journey IS 'Journey-based player view replacing skill level classifications. Shows objective experience levels based on match history and activity.';