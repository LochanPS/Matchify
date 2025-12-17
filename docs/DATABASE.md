# Database Schema Documentation

## Overview

Pathfinder Enhanced uses PostgreSQL 14+ as the primary database with a relational schema optimized for tournament management.

## Database Architecture

### Technology
- **Database**: PostgreSQL 14+
- **ORM**: Native pg driver (no ORM for better control)
- **Migrations**: SQL scripts in `/backend/migrations/`
- **Connection Pooling**: pg Pool for efficient connections

### Hosting Options
1. **Railway** (Recommended) - $5/month free credit
2. **Supabase** - 500MB free tier
3. **Local PostgreSQL** - For development

## Schema Overview

### Tables (4)
1. **users** - Player and organizer accounts
2. **tournaments** - Tournament information
3. **participants** - Junction table for tournament registrations
4. **matches** - Individual match records

### Enums (6)
- `user_role`: player, organizer
- `skill_level`: beginner, intermediate, advanced
- `match_type`: singles, doubles
- `tournament_format`: knockout, league
- `tournament_status`: upcoming, live, completed
- `match_status`: scheduled, completed

## Table Schemas

### users
Stores all user accounts with role-based differentiation.

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    skill_level skill_level NULL,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    organizer_contact VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- Players must have `skill_level`, no `organizer_contact`
- Organizers must have `organizer_contact`, no `skill_level`
- `wins` cannot exceed `matches_played`

**Indexes:**
- `idx_users_firebase_uid` on firebase_uid
- `idx_users_email` on email
- `idx_users_role` on role
- `idx_users_city` on city

### tournaments
Stores tournament information with foreign key to organizer.

```sql
CREATE TABLE tournaments (
    tournament_id UUID PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES users(user_id),
    tournament_name VARCHAR(200) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    tournament_date DATE NOT NULL,
    match_type match_type NOT NULL,
    format tournament_format NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_money DECIMAL(10,2) DEFAULT 0,
    max_players INTEGER NOT NULL CHECK (max_players IN (8, 16, 32)),
    current_players INTEGER DEFAULT 0,
    status tournament_status DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `current_players` cannot exceed `max_players`
- `max_players` must be 8, 16, or 32
- Cascade delete when organizer is deleted

**Indexes:**
- `idx_tournaments_organizer` on organizer_id
- `idx_tournaments_date` on tournament_date
- `idx_tournaments_status` on status
- `idx_tournaments_match_type` on match_type
- `idx_tournaments_search` on (tournament_name, venue)

### participants
Junction table linking players to tournaments.

```sql
CREATE TABLE participants (
    participant_id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id),
    player_id UUID NOT NULL REFERENCES users(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, player_id)
);
```

**Constraints:**
- Unique combination of `tournament_id` and `player_id`
- Cascade delete when tournament or player is deleted
- Trigger validates player role before insert

**Indexes:**
- `idx_participants_tournament` on tournament_id
- `idx_participants_player` on player_id
- `idx_participants_joined_at` on joined_at

### matches
Stores individual match information with players and scores.

```sql
CREATE TABLE matches (
    match_id UUID PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id),
    player1_id UUID NOT NULL REFERENCES users(user_id),
    player2_id UUID NOT NULL REFERENCES users(user_id),
    round VARCHAR(50) NOT NULL,
    player1_score INTEGER NULL,
    player2_score INTEGER NULL,
    winner_id UUID NULL REFERENCES users(user_id),
    match_status match_status DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `player1_id` must differ from `player2_id`
- `winner_id` must be either `player1_id` or `player2_id`
- Scheduled matches have no scores or winner
- Completed matches must have scores and winner

**Indexes:**
- `idx_matches_tournament` on tournament_id
- `idx_matches_player1` on player1_id
- `idx_matches_player2` on player2_id
- `idx_matches_winner` on winner_id
- `idx_matches_round` on round
- `idx_matches_status` on match_status

## Relationships

```
users (organizer)
  ↓ 1:N
tournaments
  ↓ 1:N
participants ← N:1 → users (player)
  ↓
matches ← N:1 → users (players)
```

## Triggers

### validate_organizer_role
Ensures only users with `role = 'organizer'` can create tournaments.

### validate_player_role
Ensures only users with `role = 'player'` can join tournaments.

## Setup Instructions

### 1. Install PostgreSQL
```bash
# Mac
brew install postgresql@14

# Ubuntu
sudo apt install postgresql postgresql-contrib

# Windows
# Download from postgresql.org
```

### 2. Create Database
```bash
psql postgres
CREATE DATABASE pathfinder_enhanced;
CREATE USER pathfinder_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pathfinder_enhanced TO pathfinder_user;
\q
```

### 3. Configure Environment
```bash
# backend/.env
DATABASE_URL=postgresql://pathfinder_user:your_password@localhost:5432/pathfinder_enhanced
```

### 4. Run Migrations
```bash
cd backend
node scripts/runMigrations.js
```

### 5. Test Connection
```bash
node scripts/testConnection.js
```

## Common Queries

### Get all upcoming tournaments
```sql
SELECT t.*, u.name as organizer_name
FROM tournaments t
JOIN users u ON t.organizer_id = u.user_id
WHERE t.status = 'upcoming'
ORDER BY t.tournament_date ASC;
```

### Get player statistics
```sql
SELECT 
  name, 
  matches_played, 
  wins,
  ROUND((wins::DECIMAL / NULLIF(matches_played, 0)) * 100, 2) as win_rate
FROM users
WHERE role = 'player'
ORDER BY win_rate DESC;
```

### Get tournament participants
```sql
SELECT u.name, u.skill_level, p.joined_at
FROM participants p
JOIN users u ON p.player_id = u.user_id
WHERE p.tournament_id = 'TOURNAMENT_ID'
ORDER BY p.joined_at ASC;
```

## Backup & Restore

### Backup
```bash
pg_dump -U pathfinder_user pathfinder_enhanced > backup.sql
```

### Restore
```bash
psql -U pathfinder_user pathfinder_enhanced < backup.sql
```

## Performance Optimization

### Indexes
All foreign keys have indexes for fast joins.
Composite index on (tournament_name, venue) for search.

### Connection Pooling
Using pg Pool with configurable pool size.

### Query Optimization
- Use prepared statements
- Limit result sets with LIMIT/OFFSET
- Use EXISTS instead of COUNT when checking existence

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2024-12-17 | Initial schema with 4 tables, 6 enums, triggers |

## Next Steps

- [ ] Add full-text search on tournament names
- [ ] Implement soft deletes for tournaments
- [ ] Add tournament history archival
- [ ] Create materialized views for analytics
