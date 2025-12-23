-- Migration 034: Remove skill levels and add objective stats
-- Date: January 1, 2025
-- Purpose: Complete skill level removal and implement objective player stats

-- Step 1: Remove skill_level column from users table
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Step 2: Add new objective stats columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_participated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_tournament_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Update existing users with calculated stats
UPDATE users SET 
  losses = GREATEST(0, COALESCE(matches_played, 0) - COALESCE(wins, 0)),
  last_active_date = CURRENT_TIMESTAMP,
  tournaments_participated = 0,
  tournaments_won = 0,
  current_streak = 0,
  best_streak = COALESCE(wins, 0)
WHERE losses IS NULL;

-- Step 4: Create categories table for multi-category tournaments
CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('singles', 'doubles', 'mixed_doubles')),
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money_winner DECIMAL(10,2) DEFAULT 0,
  prize_money_runner_up DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  format VARCHAR(20) NOT NULL CHECK (format IN ('knockout', 'league', 'group_knockout')),
  points_per_game INTEGER DEFAULT 21,
  best_of INTEGER DEFAULT 1 CHECK (best_of IN (1, 3, 5)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_tournament_id ON categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_categories_match_type ON categories(match_type);
CREATE INDEX IF NOT EXISTS idx_categories_format ON categories(format);

-- Step 6: Create category_participants table for registration tracking
CREATE TABLE IF NOT EXISTS category_participants (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  partner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  partner_name VARCHAR(100),
  partner_email VARCHAR(255),
  partner_phone VARCHAR(15),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_id VARCHAR(255),
  registration_status VARCHAR(20) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'withdrawn')),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, player_id)
);

-- Step 7: Create indexes for category_participants table
CREATE INDEX IF NOT EXISTS idx_category_participants_category_id ON category_participants(category_id);
CREATE INDEX IF NOT EXISTS idx_category_participants_player_id ON category_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_category_participants_payment_status ON category_participants(payment_status);
CREATE INDEX IF NOT EXISTS idx_category_participants_registration_status ON category_participants(registration_status);

-- Step 8: Add category_id to matches table for category-specific matches
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL;

-- Step 9: Add partner support to matches table for doubles
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS player1_partner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS player2_partner_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Step 10: Add multi-game score support to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS player1_game1_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_game1_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player1_game2_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_game2_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player1_game3_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_game3_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 1;

-- Step 11: Create index for matches category_id
CREATE INDEX IF NOT EXISTS idx_matches_category_id ON matches(category_id);

-- Step 12: Add poster support to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS poster_public_id VARCHAR(255);

-- Migration completed successfully
-- All skill level references removed
-- Multi-category tournament support added
-- Objective player stats implemented