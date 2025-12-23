-- Day 57: Error Logging Table for Monitoring
-- Creates error_logs table to track system errors

CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  error_type VARCHAR(100) NOT NULL,
  message TEXT,
  status_code INTEGER,
  endpoint VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  stack_trace TEXT,
  request_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint ON error_logs(endpoint);

-- Add comment
COMMENT ON TABLE error_logs IS 'Tracks system errors for monitoring and debugging';
