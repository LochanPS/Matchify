-- Day 53: Notification System
-- Adds multi-channel notifications (email, SMS, push)

-- Create notifications table
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE email_logs (
  email_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  template VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  email_tournaments BOOLEAN DEFAULT TRUE,
  email_matches BOOLEAN DEFAULT TRUE,
  email_payments BOOLEAN DEFAULT TRUE,
  email_community BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Add comments
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON TABLE email_logs IS 'Logs all email notifications sent';
COMMENT ON TABLE notification_preferences IS 'User preferences for notifications';
COMMENT ON COLUMN notifications.type IS 'Notification type: tournament_joined, match_scheduled, result_posted, payment_received, etc.';
COMMENT ON COLUMN notifications.data IS 'Additional context as JSON (tournament_id, match_id, etc.)';
COMMENT ON COLUMN email_logs.status IS 'Email status: pending, sent, failed';
