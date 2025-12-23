-- Day 62: Tournament Poster Upload & Payment System
-- Adds poster support and registration/payment infrastructure

-- Step 1: Add poster fields to tournaments table
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS poster_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS poster_public_id VARCHAR(255);

-- Step 2: Create registrations table for player registration + payment
CREATE TABLE IF NOT EXISTS registrations (
  registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  
  -- Registration Details
  player_name VARCHAR(100) NOT NULL,
  player_email VARCHAR(255) NOT NULL,
  player_phone VARCHAR(15) NOT NULL,
  
  -- Payment Details
  entry_fee DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),  -- Razorpay order_id
  payment_method VARCHAR(50),  -- UPI, Card, NetBanking, etc.
  paid_at TIMESTAMP,
  
  -- Timestamps
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, player_id, category_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_player ON registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_category ON registrations(category_id);
CREATE INDEX IF NOT EXISTS idx_registrations_paid_at ON registrations(paid_at);

-- Step 4: Add payment tracking to tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_registrations INTEGER DEFAULT 0;

-- Step 5: Create view for registration analytics
CREATE OR REPLACE VIEW registration_analytics AS
SELECT
  t.tournament_id,
  t.tournament_name,
  COUNT(DISTINCT r.registration_id) as total_registrations,
  COUNT(DISTINCT CASE WHEN r.payment_status = 'paid' THEN r.registration_id END) as paid_registrations,
  COUNT(DISTINCT CASE WHEN r.payment_status = 'pending' THEN r.registration_id END) as pending_registrations,
  COUNT(DISTINCT CASE WHEN r.payment_status = 'failed' THEN r.registration_id END) as failed_registrations,
  SUM(CASE WHEN r.payment_status = 'paid' THEN r.entry_fee ELSE 0 END) as total_revenue,
  AVG(CASE WHEN r.payment_status = 'paid' THEN r.entry_fee ELSE NULL END) as avg_entry_fee
FROM tournaments t
LEFT JOIN registrations r ON t.tournament_id = r.tournament_id
GROUP BY t.tournament_id, t.tournament_name;

-- Step 6: Create function to update tournament stats
CREATE OR REPLACE FUNCTION update_tournament_stats(tournament_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tournaments
  SET
    total_registrations = (
      SELECT COUNT(*) FROM registrations
      WHERE tournament_id = $1 AND payment_status = 'paid'
    ),
    total_revenue = (
      SELECT COALESCE(SUM(entry_fee), 0) FROM registrations
      WHERE tournament_id = $1 AND payment_status = 'paid'
    ),
    updated_at = NOW()
  WHERE tournament_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to update stats on registration payment
CREATE OR REPLACE FUNCTION trigger_update_tournament_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    PERFORM update_tournament_stats(NEW.tournament_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tournament_stats ON registrations;
CREATE TRIGGER trg_update_tournament_stats
AFTER UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION trigger_update_tournament_stats();

-- Step 8: Add comments
COMMENT ON TABLE registrations IS 'Player registrations with payment tracking';
COMMENT ON COLUMN registrations.payment_status IS 'pending, paid, failed, or refunded';
COMMENT ON COLUMN registrations.payment_id IS 'Razorpay order ID for payment tracking';
COMMENT ON VIEW registration_analytics IS 'Analytics view for tournament registration and payment data';

-- Step 9: Verify migration
SELECT
  COUNT(*) as total_tournaments,
  COUNT(CASE WHEN poster_url IS NOT NULL THEN 1 END) as tournaments_with_posters
FROM tournaments;

-- Step 10: Log migration
INSERT INTO migration_log (migration_name, status, executed_at, description)
VALUES (
  '062_poster_and_payment_system',
  'completed',
  NOW(),
  'Added poster support and registration/payment system with Razorpay integration'
);
