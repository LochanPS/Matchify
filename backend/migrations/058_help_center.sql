-- Day 58: Help Center & Support System
-- Creates FAQ, guides, troubleshooting, and support ticket tables

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Help Guides Table
CREATE TABLE IF NOT EXISTS help_guides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50), -- 'player', 'organizer', 'all'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Troubleshooting Articles Table
CREATE TABLE IF NOT EXISTS troubleshooting_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  response TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'bug', 'feature_request', 'general'
  message TEXT NOT NULL,
  rating INTEGER, -- 1-5 star rating
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_guides_role ON help_guides(target_role);
CREATE INDEX IF NOT EXISTS idx_guides_active ON help_guides(is_active);
CREATE INDEX IF NOT EXISTS idx_troubleshooting_active ON troubleshooting_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_support_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON user_feedback(type);

-- Insert default FAQ items
INSERT INTO faq_items (category, question, answer, display_order) VALUES
('Account & Authentication', 'How do I create an account?', 'Click on Sign Up, enter your email and password, select your role (Player or Organizer), and enter your city. That''s it!', 1),
('Account & Authentication', 'How do I reset my password?', 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email.', 2),
('Account & Authentication', 'Can I change my role after signup?', 'Currently, you cannot change your role after signup. If you need to, please contact support.', 3),
('Tournaments & Registration', 'How do I join a tournament?', 'Browse tournaments, click on one that interests you, and click "Register". If there''s an entry fee, you''ll be directed to payment.', 1),
('Tournaments & Registration', 'Can I withdraw from a tournament?', 'Yes, you can withdraw before the tournament starts. Go to your profile, find the tournament, and click "Withdraw".', 2),
('Tournaments & Registration', 'What happens if I don''t show up?', 'If you don''t show up, you may be marked as absent. Repeated no-shows may affect your tournament eligibility.', 3),
('Payments & Refunds', 'What payment methods do you accept?', 'We accept all major credit/debit cards and UPI payments through Razorpay.', 1),
('Payments & Refunds', 'How do I get a refund?', 'If you withdraw before the tournament starts, you''ll get a full refund. Contact support for other refund requests.', 2),
('Payments & Refunds', 'Is my payment information secure?', 'Yes, all payments are processed through Razorpay, a PCI-DSS compliant payment gateway.', 3),
('Matches & Scoring', 'How are matches generated?', 'Matches are generated based on the tournament format (Knockout or League) and the number of participants.', 1),
('Matches & Scoring', 'How do I enter match scores?', 'If you''re the organizer, go to the tournament, find the match, and click "Enter Score". If you''re a player, the organizer will enter the score.', 2),
('Matches & Scoring', 'Can I dispute a match result?', 'Contact the tournament organizer immediately. They can update the score if there was an error.', 3),
('Community Features', 'How do I join a community group?', 'Go to the Community section, find a group that interests you, and click "Join".', 1),
('Community Features', 'Can I create my own group?', 'Yes, go to Community, click "Create Group", and set up your group with a name and description.', 2),
('Community Features', 'How do I post in forums?', 'Go to the Forums section, find a category, and click "New Topic" to start a discussion.', 3),
('Technical Issues', 'The app is loading slowly', 'Try refreshing the page, clearing your browser cache, or checking your internet connection.', 1),
('Technical Issues', 'I''m not receiving notifications', 'Check your notification settings in the app. Make sure notifications are enabled for your browser/device.', 2),
('Technical Issues', 'I found a bug', 'Please report it using the feedback form in the app. Include details about what happened and how to reproduce it.', 3);

-- Insert default help guides
INSERT INTO help_guides (title, content, target_role, display_order) VALUES
('Getting Started as a Player', 'Welcome to MATCHIFY! Here''s how to get started: 1. Create your account 2. Complete your profile 3. Browse tournaments in your city 4. Join a tournament 5. Play and track your stats!', 'player', 1),
('Getting Started as an Organizer', 'Welcome to MATCHIFY! Here''s how to organize tournaments: 1. Create your account as an organizer 2. Set up your profile 3. Create your first tournament 4. Invite players 5. Manage matches and scores!', 'organizer', 1),
('Understanding Your Player Profile', 'Your profile shows your tournament history, match statistics, and achievements. The more you play, the more your profile grows!', 'player', 2),
('Tournament Creation Guide', 'To create a tournament: 1. Go to your dashboard 2. Click "Create Tournament" 3. Fill in tournament details 4. Set the format (Knockout or League) 5. Publish and invite players!', 'organizer', 2);

-- Insert default troubleshooting articles
INSERT INTO troubleshooting_articles (title, content, category, display_order) VALUES
('Payment Failed', 'If your payment fails: 1. Check your internet connection 2. Verify card details 3. Try a different payment method 4. Contact your bank 5. Reach out to support if the issue persists', 'Payments', 1),
('Can''t Find a Tournament', 'If you can''t find a tournament: 1. Check the city filter 2. Try searching by name 3. Check the date range 4. Look in nearby cities 5. Contact support if you think a tournament is missing', 'Tournaments', 1),
('Match Score Dispute', 'If there''s a dispute about a match score: 1. Contact the tournament organizer 2. Provide evidence (photos, witnesses) 3. Wait for organizer review 4. Escalate to support if needed', 'Matches', 1),
('Account Access Issues', 'If you can''t access your account: 1. Try resetting your password 2. Clear browser cache 3. Try a different browser 4. Check your email for verification links 5. Contact support', 'Account', 1);

-- Add comment
COMMENT ON TABLE faq_items IS 'Frequently asked questions organized by category';
COMMENT ON TABLE help_guides IS 'Getting started guides for different user roles';
COMMENT ON TABLE troubleshooting_articles IS 'Troubleshooting articles for common issues';
COMMENT ON TABLE support_tickets IS 'User support tickets for direct assistance';
COMMENT ON TABLE user_feedback IS 'User feedback for bugs, features, and general comments';
