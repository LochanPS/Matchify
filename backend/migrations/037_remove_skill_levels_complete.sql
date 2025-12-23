-- Day 37: Complete Skill Level Removal & Product Architecture Redesign
-- This migration removes all skill-level classifications and implements
-- objective player tracking with category-based tournament structure

-- ============================================================================
-- STEP 1: Remove skill_level column from users table
-- ============================================================================

-- Remove skill_level column completely
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Add new objective tracking fields
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
-- STEP 2: Update tournaments table structure
-- ============================================================================

-- Remove category-specific fields (moved to categories table)
ALTER TABLE tournaments 
DROP COLUMN IF EXISTS match_type,
DROP COLUMN IF EXISTS entry_fee,
DROP COLUMN IF EXISTS prize_money,
DROP COLUMN IF EXISTS max_players,
DROP COLUMN IF EXISTS current_players;

-- Add poster support
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS poster_public_id VARCHAR(255) NULL;

-- ============================================================================
-- STEP 3: Create categories table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    match_format ENUM('singles', 'doubles') NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_money_winner DECIMAL(10,2) DEFAULT 0,
    prize_money_runnerup DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    registration_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 4: Update participants table for category-based registration
-- ============================================================================

-- Add category support and payment tracking
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(category_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS registration_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_email VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_phone VARCHAR(15) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS registered_entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update constraint to allow multiple category registrations per tournament
DROP CONSTRAINT IF EXISTS participants_tournament_player_unique;
ALTER TABLE participants 
ADD CONSTRAINT participants_tournament_category_player_unique 
UNIQUE(tournament_id, category_id, player_id);

-- ============================================================================
-- STEP 5: Update matches table for category support
-- ============================================================================

-- Add category reference to matches
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(category_id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 6: Create registrations table for payment tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Registration form data
    registration_name VARCHAR(100) NOT NULL,
    registration_email VARCHAR(255) NOT NULL,
    registration_phone VARCHAR(15) NOT NULL,
    
    -- Payment tracking
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2) NOT NULL,
    registered_entry_fee DECIMAL(10,2) NOT NULL, -- Price at time of registration
    payment_id VARCHAR(255) NULL, -- Razorpay payment ID
    payment_signature VARCHAR(255) NULL, -- Razorpay signature
    payment_timestamp TIMESTAMP NULL,
    
    -- Metadata
    registration_ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(tournament_id, category_id, player_id)
);

-- ============================================================================
-- STEP 7: Data backfill for existing users
-- ============================================================================

-- Calculate first_tournament_date for existing players
UPDATE users 
SET first_tournament_date = (
    SELECT MIN(joined_at)::DATE
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player' AND first_tournament_date IS NULL;

-- Calculate last_active_date for existing players
UPDATE users 
SET last_active_date = (
    SELECT MAX(joined_at)::DATE
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player' AND last_active_date IS NULL;

-- Calculate total_tournaments for existing players
UPDATE users 
SET total_tournaments = (
    SELECT COUNT(DISTINCT tournament_id)
    FROM participants 
    WHERE participants.player_id = users.user_id
)
WHERE role = 'player';

-- Calculate losses from matches (total matches - wins)
UPDATE users 
SET losses = GREATEST(0, matches_played - wins)
WHERE role = 'player';

-- ============================================================================
-- STEP 8: Create indexes for performance
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_tournament_id ON categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_categories_match_format ON categories(match_format);

-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_category_id ON registrations(category_id);
CREATE INDEX IF NOT EXISTS idx_registrations_player_id ON registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- Participants indexes (updated)
CREATE INDEX IF NOT EXISTS idx_participants_category_id ON participants(category_id);
CREATE INDEX IF NOT EXISTS idx_participants_payment_status ON participants(payment_status);

-- Matches indexes (updated)
CREATE INDEX IF NOT EXISTS idx_matches_category_id ON matches(category_id);

-- Users indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_first_tournament_date ON users(first_tournament_date);
CREATE INDEX IF NOT EXISTS idx_users_last_active_date ON users(last_active_date);
CREATE INDEX IF NOT EXISTS idx_users_total_tournaments ON users(total_tournaments);

-- ============================================================================
-- STEP 9: Create views for common queries
-- ============================================================================

-- Player journey view (replaces skill level display)
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

-- Tournament category summary view
CREATE OR REPLACE VIEW tournament_categories_summary AS
SELECT 
    t.tournament_id,
    t.name as tournament_name,
    t.date as tournament_date,
    t.venue,
    t.city,
    t.status,
    COUNT(c.category_id) as total_categories,
    SUM(c.current_participants) as total_participants,
    SUM(c.max_participants) as total_capacity,
    SUM(c.entry_fee * c.current_participants) as total_revenue,
    SUM(c.prize_money_winner + c.prize_money_runnerup) as total_prizes
FROM tournaments t
LEFT JOIN categories c ON t.tournament_id = c.tournament_id
GROUP BY t.tournament_id, t.name, t.date, t.venue, t.city, t.status;

-- ============================================================================
-- STEP 10: Update triggers for automatic calculations
-- ============================================================================

-- Function to update user stats after match completion
CREATE OR REPLACE FUNCTION update_user_stats_after_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Update winner stats
    IF NEW.winner_id IS NOT NULL THEN
        UPDATE users 
        SET 
            wins = wins + 1,
            matches_played = matches_played + 1,
            last_active_date = CURRENT_DATE,
            current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1)
        WHERE user_id = NEW.winner_id;
        
        -- Update loser stats
        IF NEW.player1_id = NEW.winner_id THEN
            UPDATE users 
            SET 
                losses = losses + 1,
                matches_played = matches_played + 1,
                last_active_date = CURRENT_DATE,
                current_streak = 0
            WHERE user_id = NEW.player2_id;
        ELSE
            UPDATE users 
            SET 
                losses = losses + 1,
                matches_played = matches_played + 1,
                last_active_date = CURRENT_DATE,
                current_streak = 0
            WHERE user_id = NEW.player1_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match completion
DROP TRIGGER IF EXISTS trigger_update_user_stats_after_match ON matches;
CREATE TRIGGER trigger_update_user_stats_after_match
    AFTER UPDATE ON matches
    FOR EACH ROW
    WHEN (OLD.winner_id IS NULL AND NEW.winner_id IS NOT NULL)
    EXECUTE FUNCTION update_user_stats_after_match();

-- Function to update category participant count
CREATE OR REPLACE FUNCTION update_category_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories 
        SET current_participants = current_participants + 1
        WHERE category_id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET current_participants = GREATEST(0, current_participants - 1)
        WHERE category_id = OLD.category_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for participant count updates
DROP TRIGGER IF EXISTS trigger_update_category_count_insert ON registrations;
CREATE TRIGGER trigger_update_category_count_insert
    AFTER INSERT ON registrations
    FOR EACH ROW
    WHEN (NEW.payment_status = 'paid')
    EXECUTE FUNCTION update_category_participant_count();

DROP TRIGGER IF EXISTS trigger_update_category_count_delete ON registrations;
CREATE TRIGGER trigger_update_category_count_delete
    AFTER DELETE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_category_participant_count();

-- ============================================================================
-- STEP 11: Sample data migration (for existing tournaments)
-- ============================================================================

-- Create default categories for existing tournaments that don't have them
INSERT INTO categories (tournament_id, category_name, match_format, entry_fee, prize_money_winner, max_participants)
SELECT 
    t.tournament_id,
    CASE 
        WHEN t.match_type = 'singles' THEN 'Open Singles'
        WHEN t.match_type = 'doubles' THEN 'Open Doubles'
        ELSE 'Open Category'
    END as category_name,
    COALESCE(t.match_type::text, 'singles')::match_format_enum as match_format,
    COALESCE(t.entry_fee, 0) as entry_fee,
    COALESCE(t.prize_money, 0) as prize_money_winner,
    COALESCE(t.max_players, 16) as max_participants
FROM tournaments t
WHERE NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.tournament_id = t.tournament_id
)
AND t.match_type IS NOT NULL; -- Only migrate tournaments that had match_type

-- Migrate existing participants to registrations table
INSERT INTO registrations (
    tournament_id, 
    category_id, 
    player_id, 
    registration_name, 
    registration_email, 
    registration_phone,
    payment_status,
    payment_amount,
    registered_entry_fee,
    created_at
)
SELECT 
    p.tournament_id,
    c.category_id,
    p.player_id,
    u.name as registration_name,
    u.email as registration_email,
    COALESCE(u.organizer_contact, '0000000000') as registration_phone,
    'paid' as payment_status, -- Assume existing participants have paid
    c.entry_fee as payment_amount,
    c.entry_fee as registered_entry_fee,
    p.joined_at as created_at
FROM participants p
JOIN users u ON p.player_id = u.user_id
JOIN categories c ON p.tournament_id = c.tournament_id
WHERE NOT EXISTS (
    SELECT 1 FROM registrations r 
    WHERE r.tournament_id = p.tournament_id 
    AND r.player_id = p.player_id
);

-- Update category participant counts based on registrations
UPDATE categories 
SET current_participants = (
    SELECT COUNT(*)
    FROM registrations r
    WHERE r.category_id = categories.category_id
    AND r.payment_status = 'paid'
);

-- ============================================================================
-- STEP 12: Clean up old data (optional - run after verification)
-- ============================================================================

-- Note: Uncomment these after verifying the migration worked correctly

-- Remove old participants records that have been migrated to registrations
-- DELETE FROM participants 
-- WHERE EXISTS (
--     SELECT 1 FROM registrations r 
--     WHERE r.tournament_id = participants.tournament_id 
--     AND r.player_id = participants.player_id
-- );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES (
    '037_remove_skill_levels_complete',
    CURRENT_TIMESTAMP,
    'Complete removal of skill level classifications and implementation of objective player tracking with category-based tournament structure'
) ON CONFLICT (migration_name) DO UPDATE SET 
    executed_at = CURRENT_TIMESTAMP,
    description = EXCLUDED.description;

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    migration_name VARCHAR(255) PRIMARY KEY,
    executed_at TIMESTAMP NOT NULL,
    description TEXT
);