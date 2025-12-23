-- Day 55: Advanced Analytics Dashboard
-- Adds comprehensive analytics tables for tracking organizer, player, and platform metrics

-- Analytics snapshots table (for historical tracking)
CREATE TABLE analytics_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'organizer', 'player', 'platform'
  entity_id UUID, -- organizer_id, player_id, or NULL for platform
  metrics JSONB NOT NULL, -- Flexible JSON for different metric types
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament analytics (detailed stats per tournament)
CREATE TABLE tournament_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  total_participants INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  completed_matches INTEGER DEFAULT 0,
  average_match_duration INTEGER DEFAULT 0, -- in minutes
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Player performance tracking (monthly aggregation)
CREATE TABLE player_performance (
  performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  tournaments_played INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizer performance tracking (monthly aggregation)
CREATE TABLE organizer_performance (
  performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  tournaments_created INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily metrics for platform-wide tracking
CREATE TABLE daily_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  total_organizers INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_tournaments INTEGER DEFAULT 0,
  tournaments_created INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  matches_completed INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_analytics_snapshots_entity ON analytics_snapshots(entity_id);
CREATE INDEX idx_analytics_snapshots_type ON analytics_snapshots(metric_type);
CREATE INDEX idx_tournament_analytics_tournament ON tournament_analytics(tournament_id);
CREATE INDEX idx_tournament_analytics_created ON tournament_analytics(created_at);
CREATE INDEX idx_player_performance_player ON player_performance(player_id);
CREATE INDEX idx_player_performance_month ON player_performance(month);
CREATE INDEX idx_organizer_performance_organizer ON organizer_performance(organizer_id);
CREATE INDEX idx_organizer_performance_month ON organizer_performance(month);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(metric_date);

-- Add comments
COMMENT ON TABLE analytics_snapshots IS 'Historical snapshots of analytics metrics for trend analysis';
COMMENT ON TABLE tournament_analytics IS 'Detailed analytics for each tournament';
COMMENT ON TABLE player_performance IS 'Monthly performance aggregation for players';
COMMENT ON TABLE organizer_performance IS 'Monthly performance aggregation for organizers';
COMMENT ON TABLE daily_metrics IS 'Daily platform-wide metrics for monitoring';

COMMENT ON COLUMN analytics_snapshots.metric_type IS 'Type of metric: organizer, player, or platform';
COMMENT ON COLUMN analytics_snapshots.entity_id IS 'ID of entity (organizer_id, player_id, or NULL for platform)';
COMMENT ON COLUMN analytics_snapshots.metrics IS 'JSON object containing metric values';
COMMENT ON COLUMN tournament_analytics.average_match_duration IS 'Average duration in minutes';
COMMENT ON COLUMN player_performance.month IS 'First day of the month for aggregation';
COMMENT ON COLUMN organizer_performance.month IS 'First day of the month for aggregation';
COMMENT ON COLUMN daily_metrics.metric_date IS 'Date of the metrics';

