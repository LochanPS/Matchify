-- Day 52: Tournament Poster Upload
-- Adds poster support to tournaments

-- Add poster_url column to tournaments table
ALTER TABLE tournaments ADD COLUMN poster_url VARCHAR(500) NULL;

-- Create tournament_media table for future expansion
CREATE TABLE tournament_media (
  media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(user_id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tournament_media_tournament_id ON tournament_media(tournament_id);
CREATE INDEX idx_tournament_media_type ON tournament_media(media_type);

-- Add comment
COMMENT ON TABLE tournament_media IS 'Stores tournament media files (posters, gallery, rules)';
COMMENT ON COLUMN tournaments.poster_url IS 'URL to tournament poster image';
