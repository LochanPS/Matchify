-- Migration 041: Feedback Collection System
-- Date: December 20, 2025
-- Purpose: Add feedback collection and management system

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'general')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('ui', 'performance', 'functionality', 'mobile', 'other')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  user_email VARCHAR(255),
  user_role VARCHAR(20),
  page_url VARCHAR(500),
  browser_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create feedback_logs table for tracking updates
CREATE TABLE IF NOT EXISTS feedback_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_logs_feedback_id ON feedback_logs(feedback_id);

-- Migration completed successfully
-- Feedback collection system ready