# Day 48: Community Building

**Date:** December 20, 2025  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Forums, user groups, events, engagement programs

---

## Overview

Day 48 focuses on building community features to foster engagement, connection, and long-term retention among badminton players and organizers. This builds on the growth mechanisms from Day 47 to create lasting community bonds.

---

## Part 1: Discussion Forums (2 hours)

### 1.1 Forum Database Schema

```sql
-- Forum categories (e.g., General Discussion, Tournament Talk, Equipment)
CREATE TABLE forum_categories (
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
CREATE TABLE forum_topics (
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
CREATE TABLE forum_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(topic_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum post reactions (likes, helpful, etc.)
CREATE TABLE forum_reactions (
  reaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'helpful', 'funny'
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_reactions_post ON forum_reactions(post_id);
```

### 1.2 Forum API Endpoints

```javascript
// GET /api/forums/categories - Get all forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        fc.*,
        COUNT(ft.topic_id) as topic_count,
        MAX(ft.last_reply_at) as latest_activity
      FROM forum_categories fc
      LEFT JOIN forum_topics ft ON fc.category_id = ft.category_id AND ft.is_active = true
      WHERE fc.is_active = true
      GROUP BY fc.category_id
      ORDER BY fc.sort_order, fc.name
    `);
    
    res.json({
      success: true,
      categories: categories.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/forums/categories/:categoryId/topics - Get topics in category
router.get('/categories/:categoryId/topics', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const topics = await query(`
      SELECT 
        ft.*,
        u.name as author_name,
        lr.name as last_reply_author_name,
        COUNT(fp.post_id) as reply_count
      FROM forum_topics ft
      JOIN users u ON ft.user_id = u.user_id
      LEFT JOIN users lr ON ft.last_reply_user_id = lr.user_id
      LEFT JOIN forum_posts fp ON ft.topic_id = fp.topic_id
      WHERE ft.category_id = $1
      GROUP BY ft.topic_id, u.name, lr.name
      ORDER BY ft.is_pinned DESC, ft.last_reply_at DESC
      LIMIT $2 OFFSET $3
    `, [categoryId, limit, offset]);
    
    res.json({
      success: true,
      topics: topics.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch topics' });
  }
});

// POST /api/forums/topics - Create new topic
router.post('/topics', authenticateUser, async (req, res) => {
  try {
    const { category_id, title, content } = req.body;
    const userId = req.user.user_id;
    
    const result = await query(`
      INSERT INTO forum_topics (category_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category_id, userId, title, content]);
    
    res.json({
      success: true,
      topic: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create topic' });
  }
});
```

### 1.3 Forum Components

```jsx
// Forum category list component
const ForumCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forums/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>)}
    </div>;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Community Forums</h2>
      
      {categories.map(category => (
        <div key={category.category_id} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-lg">{category.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{category.topic_count} topics</p>
              <p className="text-xs text-gray-500">
                {category.latest_activity && formatRelativeTime(category.latest_activity)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## Part 2: User Groups by City/Interest (1.5 hours)

### 2.1 User Groups Schema

```sql
-- User groups (city-based, interest-based)
CREATE TABLE user_groups (
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
CREATE TABLE group_memberships (
  membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(group_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Group posts/updates
CREATE TABLE group_posts (
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
CREATE TABLE group_post_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES group_posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_groups_type_key ON user_groups(group_type, group_key);
CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_group_posts_group ON group_posts(group_id);
```

### 2.2 Auto-Create City Groups

```javascript
// Function to auto-create city groups when users join
const ensureCityGroup = async (cityName) => {
  try {
    // Check if city group exists
    const existing = await query(`
      SELECT * FROM user_groups 
      WHERE group_type = 'city' AND group_key = $1
    `, [cityName.toLowerCase()]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
    
    // Create new city group
    const result = await query(`
      INSERT INTO user_groups (name, description, group_type, group_key, created_by)
      VALUES ($1, $2, 'city', $3, $4)
      RETURNING *
    `, [
      `${cityName} Badminton Community`,
      `Connect with badminton players in ${cityName}. Share tournaments, find playing partners, and build the local community!`,
      cityName.toLowerCase(),
      '00000000-0000-0000-0000-000000000000' // System user
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error ensuring city group:', error);
    return null;
  }
};

// Auto-join user to city group on profile completion
const autoJoinCityGroup = async (userId, cityName) => {
  try {
    const cityGroup = await ensureCityGroup(cityName);
    if (!cityGroup) return;
    
    // Add user to city group
    await query(`
      INSERT INTO group_memberships (group_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (group_id, user_id) DO NOTHING
    `, [cityGroup.group_id, userId]);
    
    // Update member count
    await query(`
      UPDATE user_groups 
      SET member_count = (
        SELECT COUNT(*) FROM group_memberships 
        WHERE group_id = $1
      )
      WHERE group_id = $1
    `, [cityGroup.group_id]);
    
  } catch (error) {
    console.error('Error auto-joining city group:', error);
  }
};
```

### 2.3 Group Discovery Component

```jsx
const GroupDiscovery = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        fetch('/api/groups/discover'),
        fetch('/api/groups/my-groups', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);
      
      const allGroups = await allGroupsRes.json();
      const myGroupsData = await myGroupsRes.json();
      
      setGroups(allGroups.groups || []);
      setMyGroups(myGroupsData.groups || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const joinGroup = async (groupId) => {
    try {
      await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      fetchGroups(); // Refresh
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* My Groups */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Groups</h2>
        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map(group => (
              <GroupCard key={group.group_id} group={group} isMember={true} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven't joined any groups yet.</p>
        )}
      </div>
      
      {/* Discover Groups */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Discover Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.filter(g => !myGroups.find(mg => mg.group_id === g.group_id)).map(group => (
            <GroupCard 
              key={group.group_id} 
              group={group} 
              isMember={false}
              onJoin={() => joinGroup(group.group_id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const GroupCard = ({ group, isMember, onJoin }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">
            {group.group_type === 'city' ? '🏙️' : '🏸'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{group.member_count} members</span>
        {isMember ? (
          <span className="text-sm text-blue-600 font-medium">Joined</span>
        ) : (
          <button
            onClick={onJoin}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## Part 3: Community Events (2 hours)

### 3.1 Events Schema

```sql
-- Community events
CREATE TABLE community_events (
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
CREATE TABLE event_attendees (
  attendee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(event_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  status VARCHAR(20) DEFAULT 'going', -- 'going', 'maybe', 'not_going'
  registered_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- Event comments/discussion
CREATE TABLE event_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(event_id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References users table
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_community_events_city ON community_events(city);
CREATE INDEX idx_community_events_date ON community_events(start_date);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
```

### 3.2 Event Management Component

```jsx
const EventCalendar = ({ city }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, [city, selectedDate]);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/events?city=${city}&month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Event
        </button>
      </div>
      
      {/* Event Types Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Meetup', 'Workshop', 'Social', 'Tournament'].map(type => (
          <button
            key={type}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* Events List */}
      <div className="space-y-4">
        {events.map(event => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>
      
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchEvents}
        />
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const [attending, setAttending] = useState(false);
  
  const handleRSVP = async (status) => {
    try {
      await fetch(`/api/events/${event.event_id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status })
      });
      setAttending(status === 'going');
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
          <span className="text-xs text-blue-600 font-medium">
            {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-blue-600">
            {new Date(event.start_date).getDate()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {event.event_type}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
            <span>📍 {event.location}</span>
            <span>👥 {event.current_attendees}/{event.max_attendees || '∞'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRSVP('going')}
              className={`px-3 py-1 rounded-lg text-sm ${
                attending 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {attending ? 'Going' : 'Join Event'}
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Part 4: Engagement Programs (1.5 hours)

### 4.1 Community Challenges

```jsx
const CommunityChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  
  useEffect(() => {
    fetchChallenges();
  }, []);
  
  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/community/challenges', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      setChallenges(data.challenges || []);
      setUserProgress(data.user_progress || {});
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };
  
  const monthlyChallenge = {
    id: 'december_2024',
    title: 'December Tournament Challenge',
    description: 'Play in 3 tournaments this month and earn a special badge!',
    target: 3,
    current: userProgress.tournaments_this_month || 0,
    reward: 'Tournament Champion Badge',
    ends_at: '2024-12-31'
  };
  
  const weeklyChallenge = {
    id: 'week_50_2024',
    title: 'Community Helper',
    description: 'Help 5 new players by answering forum questions',
    target: 5,
    current: userProgress.forum_helps_this_week || 0,
    reward: '50 Community Points',
    ends_at: '2024-12-22'
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Community Challenges</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChallengeCard challenge={monthlyChallenge} />
        <ChallengeCard challenge={weeklyChallenge} />
      </div>
      
      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Challenge Leaderboard</h3>
        <div className="space-y-2">
          {[
            { name: 'Rahul Kumar', points: 450, badge: '🏆' },
            { name: 'Priya Sharma', points: 380, badge: '🥈' },
            { name: 'Amit Patel', points: 320, badge: '🥉' },
          ].map((player, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-lg">{player.badge}</span>
                <span className="font-medium">{player.name}</span>
              </div>
              <span className="text-sm text-gray-600">{player.points} points</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge }) => {
  const progress = (challenge.current / challenge.target) * 100;
  const isCompleted = challenge.current >= challenge.target;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
        {isCompleted && <span className="text-green-600 text-xl">✅</span>}
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{challenge.current}/{challenge.target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Reward: {challenge.reward}</span>
        <span className="text-gray-500">Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
```

### 4.2 Mentorship Program

```jsx
const MentorshipProgram = () => {
  const [mentors, setMentors] = useState([]);
  const [isMentor, setIsMentor] = useState(false);
  const [mentorRequests, setMentorRequests] = useState([]);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentorship Program</h2>
        <p className="text-gray-600 mb-4">
          Connect experienced players with newcomers to build a stronger badminton community.
        </p>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Find a Mentor
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Become a Mentor
          </button>
        </div>
      </div>
      
      {/* Available Mentors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Mentors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Rajesh Kumar',
              experience: '5+ years',
              specialties: ['Singles', 'Tournament Strategy'],
              rating: 4.9,
              sessions: 23
            },
            {
              name: 'Priya Sharma',
              experience: '3+ years',
              specialties: ['Doubles', 'Technique'],
              rating: 4.8,
              sessions: 15
            }
          ].map((mentor, index) => (
            <MentorCard key={index} mentor={mentor} />
          ))}
        </div>
      </div>
    </div>
  );
};

const MentorCard = ({ mentor }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-lg">👨‍🏫</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
          <p className="text-sm text-gray-600">{mentor.experience} experience</p>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">Specialties:</p>
        <div className="flex gap-1 flex-wrap">
          {mentor.specialties.map((specialty, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {specialty}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">⭐ {mentor.rating} ({mentor.sessions} sessions)</span>
        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          Connect
        </button>
      </div>
    </div>
  );
};
```

---

## Part 5: Community Integration (1 hour)

### 5.1 Community Navigation

```jsx
const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('forums');
  
  const tabs = [
    { id: 'forums', label: 'Forums', icon: '💬' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Community</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'forums' && <ForumCategories />}
        {activeTab === 'groups' && <GroupDiscovery />}
        {activeTab === 'events' && <EventCalendar />}
        {activeTab === 'challenges' && <CommunityChallenge />}
        {activeTab === 'mentorship' && <MentorshipProgram />}
      </div>
    </div>
  );
};
```

### 5.2 Community Stats Dashboard

```jsx
const CommunityStats = () => {
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    fetchCommunityStats();
  }, []);
  
  const fetchCommunityStats = async () => {
    try {
      const response = await fetch('/api/community/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
    }
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon="👥"
        label="Total Members"
        value={stats.total_members || 0}
        color="blue"
      />
      <StatCard
        icon="💬"
        label="Forum Posts"
        value={stats.forum_posts || 0}
        color="green"
      />
      <StatCard
        icon="📅"
        label="Events This Month"
        value={stats.events_this_month || 0}
        color="purple"
      />
      <StatCard
        icon="🏆"
        label="Active Challenges"
        value={stats.active_challenges || 0}
        color="orange"
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};
```

---

## Implementation Checklist

### Phase 1: Forums (2 hours)
- [ ] Create forum database schema
- [ ] Implement forum API endpoints
- [ ] Build forum category listing
- [ ] Create topic creation and viewing
- [ ] Add post replies and reactions

### Phase 2: User Groups (1.5 hours)
- [ ] Create user groups schema
- [ ] Implement auto city group creation
- [ ] Build group discovery interface
- [ ] Add group joining functionality
- [ ] Create group activity feeds

### Phase 3: Events (2 hours)
- [ ] Create events database schema
- [ ] Build event calendar interface
- [ ] Implement event creation
- [ ] Add RSVP functionality
- [ ] Create event management tools

### Phase 4: Engagement (1.5 hours)
- [ ] Design community challenges
- [ ] Build mentorship program
- [ ] Create engagement tracking
- [ ] Add gamification elements
- [ ] Implement reward system

### Phase 5: Integration (1 hour)
- [ ] Create community hub navigation
- [ ] Build community stats dashboard
- [ ] Integrate with existing features
- [ ] Add community notifications
- [ ] Test full community flow

---

## Success Metrics

### Community Engagement
- **Forum Activity:** 50+ posts per week
- **Group Participation:** 80% of users join city groups
- **Event Attendance:** 60% RSVP conversion rate
- **Challenge Completion:** 30% monthly participation

### User Retention
- **Daily Active Users:** 25% increase
- **Session Duration:** 40% increase
- **Return Rate:** 70% weekly return rate
- **Community Interactions:** 5+ per user per week

### Growth Metrics
- **Organic Referrals:** 20% from community features
- **User-Generated Content:** 100+ posts per month
- **Mentor Connections:** 50+ active mentorships
- **Event Creation:** 10+ community events per month

---

## Community Guidelines

### Forum Rules
1. **Be Respectful:** Treat all members with courtesy
2. **Stay On Topic:** Keep discussions relevant to badminton
3. **No Spam:** Avoid repetitive or promotional posts
4. **Help Others:** Share knowledge and support newcomers
5. **Report Issues:** Flag inappropriate content

### Event Guidelines
1. **Clear Descriptions:** Provide detailed event information
2. **Accurate Timing:** Respect scheduled times
3. **Safety First:** Ensure safe playing conditions
4. **Inclusive Events:** Welcome players of all levels
5. **Follow Through:** Honor RSVP commitments

### Group Standards
1. **Active Participation:** Contribute to group discussions
2. **Local Focus:** Keep city groups relevant to location
3. **Positive Environment:** Foster supportive community
4. **Organize Activities:** Plan regular meetups and events
5. **Moderate Fairly:** Ensure fair and consistent moderation

---

## Future Enhancements

### Phase 2 Features
- **Live Chat:** Real-time messaging for groups
- **Video Calls:** Virtual meetups and coaching
- **Content Sharing:** Photo and video uploads
- **Advanced Moderation:** AI-powered content filtering

### Integration Opportunities
- **Tournament Integration:** Link tournaments to groups
- **Achievement System:** Community-based achievements
- **Reputation System:** User credibility scoring
- **Mobile App:** Native community features

---

**Status:** 🚀 Ready to execute  
**Duration:** 8 hours  
**Next:** Day 49 - Advanced Analytics & Insights