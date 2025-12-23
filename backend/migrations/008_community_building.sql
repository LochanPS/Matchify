-- Migration 008: Community Building
-- Day 48: Community Building - Forums, Groups, Events, Engagement

-- Forum categories (e.g., General Discussion, Tournament Talk, Equipment)
CREATE TABLE IF NOT EXISTS forum_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(7), -- Hex color code
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum topics/threads
CREATE TABLE IF NOT EXISTS forum_topics (
  topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(category_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP DEFAULT NOW(),
  last_reply_user_id UUID, -- References users table
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum replies/posts
CREATE TABLE IF NOT EXISTS forum_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(topic_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum post reactions (likes, helpful, etc.)
CREATE TABLE IF NOT EXISTS forum_reactions (
  reaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'helpful', 'funny'
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, reaction_type)
);

-- User groups (city-based, interest-based)
CREATE TABLE IF NOT EXISTS user_groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  group_type VARCHAR(20) NOT NULL, -- 'city', 'interest', 'skill'
  group_key VARCHAR(50) NOT NULL, -- city name, interest keyword
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL, -- References users table
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(group_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Group posts/updates
CREATE TABLE IF NOT EXISTS group_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(group_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  post_type VARCHAR(20) DEFAULT 'text', -- 'text', 'event', 'tournament'
  metadata JSONB, -- Additional data for events, tournaments
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group post comments
CREATE TABLE IF NOT EXISTS group_post_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES group_posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community events
CREATE TABLE IF NOT EXISTS community_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- 'meetup', 'workshop', 'social', 'tournament'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(200),
  city VARCHAR(100),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT, -- For online events
  organizer_id UUID NOT NULL, -- References users table
  group_id UUID REFERENCES user_groups(group_id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  attendee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(event_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  status VARCHAR(20) DEFAULT 'going', -- 'going', 'maybe', 'not_going'
  registered_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- Event comments/discussion
CREATE TABLE IF NOT EXISTS event_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(event_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community challenges
CREATE TABLE IF NOT EXISTS community_challenges (
  challenge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL, -- 'monthly', 'weekly', 'seasonal'
  target_value INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL, -- 'badge', 'points', 'title'
  reward_value VARCHAR(100) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES community_challenges(challenge_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  current_value INTEGER DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id)
);

-- Mentorship connections
CREATE TABLE IF NOT EXISTS mentorship_connections (
  connection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL, -- References users table
  mentee_id UUID NOT NULL, -- References users table
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'cancelled'
  specialties TEXT[], -- Array of specialties
  session_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2), -- Mentee rating of mentor
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(mentor_id, mentee_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post ON forum_reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_user_groups_type_key ON user_groups(group_type, group_key);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id);

CREATE INDEX IF NOT EXISTS idx_community_events_city ON community_events(city);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

CREATE INDEX IF NOT EXISTS idx_community_challenges_active ON community_challenges(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentor ON mentorship_connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentee ON mentorship_connections(mentee_id);

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES
('General Discussion', 'General badminton discussions and community chat', '💬', '#3B82F6', 1),
('Tournament Talk', 'Discuss upcoming tournaments, results, and experiences', '🏆', '#10B981', 2),
('Equipment & Gear', 'Rackets, shoes, strings, and other badminton equipment', '🏸', '#F59E0B', 3),
('Training & Tips', 'Share training routines, techniques, and improvement tips', '💪', '#8B5CF6', 4),
('Find Playing Partners', 'Connect with players in your area for practice sessions', '👥', '#EF4444', 5),
('Announcements', 'Official announcements and platform updates', '📢', '#6B7280', 0)
ON CONFLICT DO NOTHING;

-- Insert sample community challenges
INSERT INTO community_challenges (title, description, challenge_type, target_value, reward_type, reward_value, start_date, end_date) VALUES
('December Tournament Challenge', 'Play in 3 tournaments this month and earn a special badge!', 'monthly', 3, 'badge', 'Tournament Champion', '2024-12-01', '2024-12-31'),
('Community Helper', 'Help 5 new players by answering forum questions', 'weekly', 5, 'points', '50 Community Points', NOW(), NOW() + INTERVAL '7 days'),
('New Year Resolution', 'Play 10 matches in January to start the year strong', 'monthly', 10, 'title', 'New Year Warrior', '2025-01-01', '2025-01-31')
ON CONFLICT DO NOTHING;

-- Function to auto-create city groups
CREATE OR REPLACE FUNCTION ensure_city_group(city_name TEXT)
RETURNS UUID AS $$
DECLARE
  group_id UUID;
  system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Check if city group exists
  SELECT ug.group_id INTO group_id
  FROM user_groups ug
  WHERE ug.group_type = 'city' AND ug.group_key = LOWER(city_name);
  
  -- Create if doesn't exist
  IF group_id IS NULL THEN
    INSERT INTO user_groups (name, description, group_type, group_key, created_by)
    VALUES (
      city_name || ' Badminton Community',
      'Connect with badminton players in ' || city_name || '. Share tournaments, find playing partners, and build the local community!',
      'city',
      LOWER(city_name),
      system_user_id
    )
    RETURNING user_groups.group_id INTO group_id;
  END IF;
  
  RETURN group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-join user to city group
CREATE OR REPLACE FUNCTION auto_join_city_group(user_id_param UUID, city_name TEXT)
RETURNS VOID AS $$
DECLARE
  group_id UUID;
BEGIN
  -- Ensure city group exists
  SELECT ensure_city_group(city_name) INTO group_id;
  
  -- Add user to city group
  INSERT INTO group_memberships (group_id, user_id)
  VALUES (group_id, user_id_param)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  
  -- Update member count
  UPDATE user_groups 
  SET member_count = (
    SELECT COUNT(*) FROM group_memberships 
    WHERE group_memberships.group_id = user_groups.group_id
  )
  WHERE user_groups.group_id = group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update forum topic reply count
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics 
    SET 
      reply_count = reply_count + 1,
      last_reply_at = NEW.created_at,
      last_reply_user_id = NEW.user_id
    WHERE topic_id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics 
    SET reply_count = reply_count - 1
    WHERE topic_id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update topic reply count
CREATE OR REPLACE TRIGGER trigger_update_topic_reply_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_reply_count();

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'going' THEN
      UPDATE community_events 
      SET current_attendees = current_attendees + 1
      WHERE event_id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'going' AND NEW.status = 'going' THEN
      UPDATE community_events 
      SET current_attendees = current_attendees + 1
      WHERE event_id = NEW.event_id;
    ELSIF OLD.status = 'going' AND NEW.status != 'going' THEN
      UPDATE community_events 
      SET current_attendees = current_attendees - 1
      WHERE event_id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'going' THEN
      UPDATE community_events 
      SET current_attendees = current_attendees - 1
      WHERE event_id = OLD.event_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update event attendee count
CREATE OR REPLACE TRIGGER trigger_update_event_attendee_count
  AFTER INSERT OR UPDATE OR DELETE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendee_count();

COMMIT;