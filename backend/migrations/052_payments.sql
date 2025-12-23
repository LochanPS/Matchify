-- Day 52: Payment Integration
-- Adds payment tracking for tournament entry fees

-- Create payments table
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL,
  UNIQUE(tournament_id, player_id)
);

-- Create indexes for performance
CREATE INDEX idx_payments_tournament_id ON payments(tournament_id);
CREATE INDEX idx_payments_player_id ON payments(player_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Add comment
COMMENT ON TABLE payments IS 'Tracks tournament entry fee payments';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID for payment tracking';
