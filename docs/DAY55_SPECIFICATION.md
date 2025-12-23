# Day 55: Advanced Analytics Dashboard - Specification

**Date:** December 20, 2025  
**Focus:** Comprehensive analytics dashboard for organizers and players  
**Objective:** Provide actionable insights into tournament performance, player growth, and platform metrics

---

## 🎯 Overview

Build an advanced analytics dashboard that gives organizers and players deep insights into their performance, tournament trends, and growth metrics. This dashboard will help organizers make data-driven decisions and help players track their progress.

---

## 📊 Dashboard Types

### 1. Organizer Analytics Dashboard
**Purpose:** Help organizers understand tournament performance and player engagement

**Key Metrics:**
- Total tournaments created
- Total participants across all tournaments
- Revenue generated (from entry fees)
- Average tournament size
- Tournament completion rate
- Player retention rate
- Most popular tournament formats
- Revenue trends (weekly/monthly)
- Participant growth over time
- Tournament ratings and feedback

**Visualizations:**
- Line chart: Revenue over time
- Bar chart: Tournaments by format
- Pie chart: Participant distribution
- Heatmap: Popular tournament times/days
- Table: Recent tournaments with stats

---

### 2. Player Analytics Dashboard
**Purpose:** Help players track their journey and performance

**Key Metrics:**
- Total tournaments played
- Total matches played
- Win rate (%)
- Current win streak
- Longest win streak
- Matches won/lost
- Favorite tournament format
- Most played city
- Tournament wins
- Performance trend

**Visualizations:**
- Line chart: Win rate over time
- Bar chart: Matches by format
- Pie chart: Tournaments by city
- Progress chart: Journey milestones
- Stats cards: Key metrics
- Recent matches table

---

### 3. Platform Admin Dashboard
**Purpose:** Monitor overall platform health and growth

**Key Metrics:**
- Total users (players + organizers)
- Total tournaments
- Total matches played
- Total revenue
- Active users (last 30 days)
- New users (this month)
- Player retention rate
- Most active cities
- Top organizers
- Top players

**Visualizations:**
- Dashboard cards: Key metrics
- Line chart: User growth
- Map: Active cities
- Leaderboards: Top organizers, top players
- Revenue breakdown

---

## 🗄️ Database Schema

### New Tables

```sql
-- Analytics snapshots (for historical tracking)
CREATE TABLE analytics_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'organizer', 'player', 'platform'
  entity_id UUID NOT NULL, -- organizer_id, player_id, or NULL for platform
  metrics JSONB NOT NULL, -- Flexible JSON for different metric types
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament analytics (detailed stats per tournament)
CREATE TABLE tournament_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id),
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

-- Player performance tracking
CREATE TABLE player_performance (
  performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES users(user_id),
  month DATE NOT NULL, -- First day of month
  tournaments_played INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_analytics_snapshots_entity ON analytics_snapshots(entity_id);
CREATE INDEX idx_tournament_analytics_tournament ON tournament_analytics(tournament_id);
CREATE INDEX idx_player_performance_player ON player_performance(player_id);
CREATE INDEX idx_player_performance_month ON player_performance(month);
```

---

## 🔌 API Endpoints

### Organizer Analytics

```
GET /api/analytics/organizer/dashboard
- Returns: Overview metrics for organizer dashboard
- Auth: Required (organizer role)
- Response: {
    total_tournaments: number,
    total_participants: number,
    total_revenue: number,
    average_tournament_size: number,
    completion_rate: number,
    retention_rate: number
  }

GET /api/analytics/organizer/revenue
- Query params: start_date, end_date, interval (day/week/month)
- Returns: Revenue data for charting
- Response: Array of {date, revenue, tournament_count}

GET /api/analytics/organizer/tournaments
- Query params: limit, offset, sort_by
- Returns: List of tournaments with analytics
- Response: Array of tournament analytics

GET /api/analytics/organizer/formats
- Returns: Tournament format popularity
- Response: Array of {format, count, percentage}

GET /api/analytics/organizer/feedback
- Returns: Recent feedback and ratings
- Response: Array of feedback entries
```

### Player Analytics

```
GET /api/analytics/player/dashboard
- Returns: Player's personal analytics
- Auth: Required
- Response: {
    total_tournaments: number,
    total_matches: number,
    matches_won: number,
    win_rate: number,
    current_streak: number,
    longest_streak: number,
    favorite_format: string,
    most_played_city: string
  }

GET /api/analytics/player/performance
- Query params: start_date, end_date
- Returns: Performance data over time
- Response: Array of {date, matches_played, matches_won, win_rate}

GET /api/analytics/player/matches
- Query params: limit, offset, format_filter
- Returns: Recent matches with results
- Response: Array of match records

GET /api/analytics/player/milestones
- Returns: Achievements and milestones
- Response: Array of {milestone, achieved_date, description}

GET /api/analytics/player/comparison
- Query params: compare_with_player_id
- Returns: Head-to-head comparison
- Response: Comparison object
```

### Platform Admin Analytics

```
GET /api/analytics/admin/dashboard
- Returns: Platform-wide metrics
- Auth: Required (admin role)
- Response: {
    total_users: number,
    total_organizers: number,
    total_players: number,
    total_tournaments: number,
    total_matches: number,
    total_revenue: number,
    active_users_30d: number,
    new_users_this_month: number
  }

GET /api/analytics/admin/growth
- Query params: interval (day/week/month)
- Returns: User and tournament growth
- Response: Array of growth metrics

GET /api/analytics/admin/cities
- Returns: Activity by city
- Response: Array of {city, user_count, tournament_count, activity_level}

GET /api/analytics/admin/leaderboards
- Query params: type (organizers/players), limit
- Returns: Top performers
- Response: Array of leaderboard entries
```

---

## 🎨 Frontend Components

### Organizer Dashboard Components

```
OrganizerAnalyticsDashboard/
├── AnalyticsHeader.jsx
│   └── Key metrics cards (tournaments, participants, revenue)
├── RevenueChart.jsx
│   └── Line chart showing revenue over time
├── TournamentFormatChart.jsx
│   └── Bar chart showing format popularity
├── ParticipantDistribution.jsx
│   └── Pie chart showing participant spread
├── TournamentsList.jsx
│   └── Table with recent tournaments and stats
├── FeedbackSection.jsx
│   └── Recent feedback and ratings
└── ExportButton.jsx
    └── Export analytics as CSV/PDF
```

### Player Dashboard Components

```
PlayerAnalyticsDashboard/
├── PerformanceCards.jsx
│   └── Key stats (tournaments, matches, win rate, streaks)
├── WinRateChart.jsx
│   └── Line chart showing win rate trend
├── MatchesChart.jsx
│   └── Bar chart showing matches by format
├── CityDistribution.jsx
│   └── Pie chart showing tournaments by city
├── MilestonesSection.jsx
│   └── Achievement badges and milestones
├── RecentMatches.jsx
│   └── Table with recent match results
└── ComparisonView.jsx
    └── Compare with other players
```

### Admin Dashboard Components

```
AdminAnalyticsDashboard/
├── PlatformMetrics.jsx
│   └── Key platform metrics
├── UserGrowthChart.jsx
│   └── Line chart showing user growth
├── CityHeatmap.jsx
│   └── Map showing active cities
├── TopOrganizers.jsx
│   └── Leaderboard of top organizers
├── TopPlayers.jsx
│   └── Leaderboard of top players
└── RevenueBreakdown.jsx
    └── Revenue by tournament type
```

---

## 📈 Key Features

### 1. Real-time Metrics
- Update metrics as tournaments complete
- Live participant counts
- Real-time revenue tracking

### 2. Historical Tracking
- Store snapshots of metrics over time
- Compare performance across periods
- Identify trends

### 3. Filtering & Comparison
- Filter by date range
- Compare different time periods
- Compare players/organizers

### 4. Export Functionality
- Export analytics as CSV
- Export as PDF reports
- Schedule automated reports

### 5. Visualizations
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Heatmaps for patterns
- Tables for detailed data

---

## 🔄 Data Flow

### Metric Calculation

1. **On Tournament Completion:**
   - Calculate tournament analytics
   - Update player performance stats
   - Update organizer metrics
   - Create analytics snapshot

2. **Daily Batch Job:**
   - Aggregate daily metrics
   - Calculate retention rates
   - Update leaderboards
   - Generate reports

3. **On Dashboard Load:**
   - Fetch pre-calculated metrics
   - Calculate real-time stats
   - Return formatted data

---

## 🛠️ Implementation Plan

### Phase 1: Database & Backend (Day 55 - Part 1)
- Create analytics tables
- Create indexes
- Implement metric calculation logic
- Create API endpoints

### Phase 2: Frontend Components (Day 55 - Part 2)
- Build organizer dashboard
- Build player dashboard
- Build admin dashboard
- Implement charts and visualizations

### Phase 3: Integration & Polish (Day 55 - Part 3)
- Connect frontend to API
- Add filtering and export
- Performance optimization
- Testing and verification

---

## 📊 Metrics Definitions

### Organizer Metrics
- **Total Tournaments:** Count of all tournaments created
- **Total Participants:** Sum of all participants across tournaments
- **Total Revenue:** Sum of all entry fees collected
- **Average Tournament Size:** Total participants / Total tournaments
- **Completion Rate:** Completed tournaments / Total tournaments
- **Retention Rate:** Players who played 2+ tournaments / Total players

### Player Metrics
- **Win Rate:** Matches won / Total matches played
- **Current Streak:** Consecutive wins in recent matches
- **Longest Streak:** Maximum consecutive wins ever
- **Favorite Format:** Most played tournament format
- **Most Played City:** City with most tournament participation

### Platform Metrics
- **Active Users:** Users with activity in last 30 days
- **New Users:** Users created this month
- **Player Retention:** Players who played 2+ tournaments
- **Revenue Growth:** Month-over-month revenue change

---

## 🎯 Success Criteria

- ✅ All analytics endpoints working
- ✅ Dashboards displaying correct data
- ✅ Charts rendering properly
- ✅ Export functionality working
- ✅ Performance optimized (load time <2s)
- ✅ Mobile responsive
- ✅ All metrics accurate
- ✅ 0 errors in console

---

## 📝 Notes

- Use Chart.js or Recharts for visualizations
- Cache analytics data for performance
- Calculate metrics asynchronously
- Store historical data for trend analysis
- Ensure data privacy (players only see their own data)

