-- Pathfinder Enhanced Database Schema
-- Migration 001: Initial Schema Setup
-- PostgreSQL 14+

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
-- User role enumeration
CREATE TYPE user_role AS ENUM ('player', 'organizer');

-- Player skill level enumeration
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Match type enumeration
CREATE TYPE match_type AS ENUM ('singles', 'doubles');

-- Tournament format enumeration
CREATE TYPE tournament_format AS ENUM ('knockout', 'league');

-- Tournament status enumeration
CREATE TYPE tournament_status AS ENUM ('upcoming', 'live', 'completed');

-- Match status enumeration
CREATE TYPE match_status AS ENUM ('scheduled', 'completed');

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    skill_level skill_level NULL,
    matches_played INTEGER DEFAULT 0 CHECK (matches_played >= 0),
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    organizer_contact VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_player_profile CHECK (
        (role = 'player' AND skill_level IS NOT NULL AND organizer_contact IS NULL) OR
        (role = 'organizer' AND skill_level IS NULL AND organizer_contact IS NOT NULL)
    ),
    CONSTRAINT wins_not_exceed_matches CHECK (wins <= matches_played)
);

-- Indexes for users table
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city ON users(city);

-- ============================================
-- TABLE: tournaments
-- ============================================
CREATE TABLE tournaments (
    tournament_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL,
    tournament_name VARCHAR(200) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    tournament_date DATE NOT NULL,
    match_type match_type NOT NULL,
    format tournament_format NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 0 CHECK (entry_fee >= 0),
    prize_money DECIMAL(10,2) DEFAULT 0 CHECK (prize_money >= 0),
    max_players INTEGER NOT NULL CHECK (max_players IN (8, 16, 32)),
    current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
    status tournament_status DEFAULT 'upcoming' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_player_count CHECK (current_players <= max_players)
);

-- Indexes for tournaments table
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_date ON tournaments(tournament_date);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_match_type ON tournaments(match_type);
CREATE INDEX idx_tournaments_search ON tournaments(tournament_name, venue);

-- ============================================
-- TABLE: participants
-- ============================================
CREATE TABLE participants (
    participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL,
    player_id UUID NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_tournament FOREIGN KEY (tournament_id) 
        REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    CONSTRAINT fk_player FOREIGN KEY (player_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT unique_tournament_player UNIQUE(tournament_id, player_id)
);

-- Indexes for participants table
CREATE INDEX idx_participants_tournament ON participants(tournament_id);
CREATE INDEX idx_participants_player ON participants(player_id);
CREATE INDEX idx_participants_joined_at ON participants(joined_at);

-- ============================================
-- TABLE: matches
-- ============================================
CREATE TABLE matches (
    match_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL,
    player1_id UUID NOT NULL,
    player2_id UUID NOT NULL,
    round VARCHAR(50) NOT NULL,
    player1_score INTEGER NULL CHECK (player1_score >= 0),
    player2_score INTEGER NULL CHECK (player2_score >= 0),
    winner_id UUID NULL,
    match_status match_status DEFAULT 'scheduled' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) 
        REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_player1 FOREIGN KEY (player1_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_player2 FOREIGN KEY (player2_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_winner FOREIGN KEY (winner_id) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT different_players CHECK (player1_id != player2_id),
    CONSTRAINT valid_winner CHECK (
        winner_id IS NULL OR 
        winner_id = player1_id OR 
        winner_id = player2_id
    ),
    CONSTRAINT scores_with_winner CHECK (
        (match_status = 'scheduled' AND player1_score IS NULL AND player2_score IS NULL AND winner_id IS NULL) OR
        (match_status = 'completed' AND player1_score IS NOT NULL AND player2_score IS NOT NULL AND winner_id IS NOT NULL)
    )
);

-- Indexes for matches table
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_winner ON matches(winner_id);
CREATE INDEX idx_matches_round ON matches(round);
CREATE INDEX idx_matches_status ON matches(match_status);

-- ============================================
-- TRIGGERS
-- ============================================
-- Trigger to validate organizer role when creating tournament
CREATE OR REPLACE FUNCTION validate_organizer_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = NEW.organizer_id AND role = 'organizer'
    ) THEN
        RAISE EXCEPTION 'Only users with organizer role can create tournaments';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_organizer_role
BEFORE INSERT OR UPDATE ON tournaments
FOR EACH ROW
EXECUTE FUNCTION validate_organizer_role();

-- Trigger to validate player role when joining tournament
CREATE OR REPLACE FUNCTION validate_player_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = NEW.player_id AND role = 'player'
    ) THEN
        RAISE EXCEPTION 'Only users with player role can join tournaments';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_player_role
BEFORE INSERT ON participants
FOR EACH ROW
EXECUTE FUNCTION validate_player_role();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================
-- Insert test organizer
INSERT INTO users (firebase_uid, name, email, city, role, organizer_contact)
VALUES 
    ('test_org_001', 'Rajesh Kumar', 'rajesh@badminton.com', 'Bangalore', 'organizer', '9876543210');

-- Insert test players
INSERT INTO users (firebase_uid, name, email, city, role, skill_level)
VALUES 
    ('test_player_001', 'Amit Sharma', 'amit@gmail.com', 'Bangalore', 'player', 'intermediate'),
    ('test_player_002', 'Priya Singh', 'priya@gmail.com', 'Bangalore', 'player', 'advanced'),
    ('test_player_003', 'Karthik Rao', 'karthik@gmail.com', 'Bangalore', 'player', 'beginner'),
    ('test_player_004', 'Sneha Reddy', 'sneha@gmail.com', 'Bangalore', 'player', 'intermediate');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: users, tournaments, participants, matches';
    RAISE NOTICE '🔍 Indexes: 15+ created for performance';
    RAISE NOTICE '⚡ Triggers: Role validation enabled';
    RAISE NOTICE '👥 Test data: 5 users inserted';
END $$;
