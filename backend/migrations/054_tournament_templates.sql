-- Day 54: Tournament Templates & Quick Create
-- Adds tournament template system for faster tournament creation

-- Create tournament_templates table
CREATE TABLE tournament_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  template_name VARCHAR(200) NOT NULL,
  description TEXT,
  match_type VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL,
  max_players INTEGER NOT NULL,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money DECIMAL(10,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create template_usage table for tracking
CREATE TABLE template_usage (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES tournament_templates(template_id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tournament_templates_organizer_id ON tournament_templates(organizer_id);
CREATE INDEX idx_tournament_templates_is_public ON tournament_templates(is_public);
CREATE INDEX idx_tournament_templates_created_at ON tournament_templates(created_at);
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_template_usage_organizer_id ON template_usage(organizer_id);
CREATE INDEX idx_template_usage_tournament_id ON template_usage(tournament_id);

-- Insert default templates
INSERT INTO tournament_templates (organizer_id, template_name, description, match_type, format, max_players, entry_fee, prize_money, is_public)
VALUES 
  (
    (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
    'Standard Singles',
    'Classic single elimination tournament for singles players',
    'singles',
    'knockout',
    16,
    300.00,
    5000.00,
    TRUE
  ),
  (
    (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
    'Doubles League',
    'Round-robin league format for doubles teams',
    'doubles',
    'league',
    8,
    500.00,
    8000.00,
    TRUE
  ),
  (
    (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
    'Beginner Friendly',
    'Perfect for new players - everyone plays everyone',
    'singles',
    'league',
    8,
    200.00,
    2000.00,
    TRUE
  ),
  (
    (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
    'Weekend Casual',
    'Casual weekend tournament - no pressure',
    'singles',
    'knockout',
    16,
    0.00,
    0.00,
    TRUE
  ),
  (
    (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
    'Championship',
    'Competitive championship tournament',
    'singles',
    'knockout',
    32,
    1000.00,
    50000.00,
    TRUE
  );

-- Add comments
COMMENT ON TABLE tournament_templates IS 'Stores tournament templates for quick creation';
COMMENT ON TABLE template_usage IS 'Tracks which templates are used to create tournaments';
COMMENT ON COLUMN tournament_templates.is_public IS 'Whether template is visible to all organizers';
COMMENT ON COLUMN tournament_templates.usage_count IS 'Number of times this template has been used';
