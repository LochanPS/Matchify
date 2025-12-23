# Day 32: Database Migration & System Redesign

**Date:** December 30, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Remove skill levels, implement multi-category architecture, update data models

---

## Overview

Day 32 is a critical system redesign day. We remove skill-level classifications entirely and implement the multi-category tournament architecture. This includes database schema updates, model changes, and comprehensive frontend updates to reflect the new philosophy: "Every player is equal. Their journey and history speak for themselves."

---

## Part 1: Database Schema Updates (2 hours)

### 1.1 Remove Skill Level from Users

```sql
-- Remove skill_level column
ALTER TABLE users DROP COLUMN skill_level;

-- Add new player stat columns
ALTER TABLE users
  ADD COLUMN losses INTEGER DEFAULT 0,
  ADD COLUMN tournaments_participated INTEGER DEFAULT 0,
  ADD COLUMN tournaments_won INTEGER DEFAULT 0,
  ADD COLUMN current_streak INTEGER DEFAULT 0,
  ADD COLUMN best_streak INTEGER DEFAULT 0,
  ADD COLUMN first_tournament_date DATE NULL,
  ADD COLUMN last_active_date DATE NULL;
```

**Features:**
- ✅ Remove skill_level completely
- ✅ Add objective stats columns
- ✅ Add streak tracking
- ✅ Add tournament participation tracking

### 1.2 Update Tournaments Table

```sql
-- Add poster support
ALTER TABLE tournaments
  ADD COLUMN poster_url TEXT NULL,
  ADD COLUMN poster_public_id VARCHAR(255) NULL;

-- Add indexes for performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_date ON tournaments(tournament_date);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
```

**Features:**
- ✅ Poster URL storage
- ✅ Performance indexes
- ✅ Status-based queries

### 1.3 Create Categories Table

```sql
CREATE TABLE categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  match_type ENUM('singles', 'doubles') NOT NULL,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money_winner DECIMAL(10,2) DEFAULT 0,
  prize_money_runner_up DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  format ENUM('knockout', 'league', 'group_knockout') DEFAULT 'knockout',
  points_per_game INTEGER DEFAULT 21,
  best_of INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_category_per_tournament UNIQUE(tournament_id, category_name)
);

CREATE INDEX idx_categories_tournament ON categories(tournament_id);
```

**Features:**
- ✅ Multi-category support
- ✅ Category-specific settings
- ✅ Match rules per category
- ✅ Unique constraint

### 1.4 Create Registrations Table

```sql
CREATE TABLE registrations (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  player_email VARCHAR(255) NOT NULL,
  player_phone VARCHAR(15) NOT NULL,
  partner_id UUID NULL REFERENCES users(user_id) ON DELETE SET NULL,
  partner_name VARCHAR(100) NULL,
  partner_email VARCHAR(255) NULL,
  partner_phone VARCHAR(15) NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255) NULL,
  payment_method VARCHAR(50) NULL,
  paid_at TIMESTAMP NULL,
  registration_status ENUM('registered', 'confirmed', 'cancelled', 'withdrawn') DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_player_category UNIQUE(category_id, player_id)
);

CREATE INDEX idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX idx_registrations_category ON registrations(category_id);
CREATE INDEX idx_registrations_player ON registrations(player_id);
CREATE INDEX idx_registrations_payment ON registrations(payment_status);
```

**Features:**
- ✅ Payment tracking
- ✅ Partner support
- ✅ Registration status
- ✅ Unique constraints

### 1.5 Update Matches Table

```sql
-- Add category_id to matches
ALTER TABLE matches ADD COLUMN category_id UUID REFERENCES categories(category_id);

-- Add game scores for best-of-3/5
ALTER TABLE matches
  ADD COLUMN player1_game1_score INTEGER NULL,
  ADD COLUMN player2_game1_score INTEGER NULL,
  ADD COLUMN player1_game2_score INTEGER NULL,
  ADD COLUMN player2_game2_score INTEGER NULL,
  ADD COLUMN player1_game3_score INTEGER NULL,
  ADD COLUMN player2_game3_score INTEGER NULL;

-- Add partner support for doubles
ALTER TABLE matches
  ADD COLUMN player1_partner_id UUID NULL REFERENCES users(user_id),
  ADD COLUMN player2_partner_id UUID NULL REFERENCES users(user_id);

CREATE INDEX idx_matches_category ON matches(category_id);
```

**Features:**
- ✅ Category association
- ✅ Multi-game scoring
- ✅ Doubles support
- ✅ Performance indexes

---

## Part 2: User Model Updates (1.5 hours)

### 2.1 Update User Schema

Remove skill_level references and add new stats fields:

```javascript
// User model changes
const userSchema = {
  // Remove: skill_level
  
  // Add new fields
  losses: { type: Number, default: 0 },
  tournaments_participated: { type: Number, default: 0 },
  tournaments_won: { type: Number, default: 0 },
  current_streak: { type: Number, default: 0 },
  best_streak: { type: Number, default: 0 },
  first_tournament_date: { type: Date, default: null },
  last_active_date: { type: Date, default: null },
};
```

**Features:**
- ✅ Remove skill classification
- ✅ Add objective stats
- ✅ Add streak tracking
- ✅ Add tournament history

---

## Part 3: Frontend Updates (2.5 hours)

### 3.1 Remove Skill Level from Signup

Update PlayerOnboarding to remove skill selection:

```javascript
// Remove skill level selection
// Keep: name, email, phone, city
// Add: optional profile picture
```

**Features:**
- ✅ Remove skill dropdown
- ✅ Simplify onboarding
- ✅ Faster signup

### 3.2 Update Player Profile

Show new stats format:

```javascript
// OLD: Skill Level: Intermediate
// NEW: Career Stats with objective data
```

**Features:**
- ✅ Show matches played
- ✅ Show wins/losses
- ✅ Show win rate
- ✅ Show streaks
- ✅ Show tournament history

### 3.3 Update Tournament List

Remove skill filtering, show categories:

```javascript
// OLD: Filter by skill level
// NEW: Show all tournaments with categories
```

**Features:**
- ✅ Remove skill filters
- ✅ Show categories
- ✅ Show entry fees
- ✅ Show slots available

### 3.4 Update Tournament Details

Show categories instead of single match type:

```javascript
// OLD: Match Type: Singles
// NEW: Multiple categories with different match types
```

**Features:**
- ✅ Show category cards
- ✅ Show entry fees per category
- ✅ Show prizes per category
- ✅ Category-specific registration

---

## Part 4: API Updates (1.5 hours)

### 4.1 Update Tournament API

Remove skill-level filtering:

```javascript
// Remove skill-based queries
// Update to category-based queries
```

**Features:**
- ✅ Remove skill filters
- ✅ Add category support
- ✅ Update tournament queries

### 4.2 Update Player API

Return new stats format:

```javascript
// Return: matches, wins, losses, streaks
// Remove: skill_level
```

**Features:**
- ✅ New stats format
- ✅ Remove skill data
- ✅ Add streak data

---

## Part 5: Testing & Validation (1 hour)

### 5.1 Test Scenarios

- ✅ User signup without skill selection
- ✅ Tournament creation with categories
- ✅ Player registration for category
- ✅ Stats calculation
- ✅ Streak tracking

---

## Implementation Checklist

### Phase 1: Database (2 hours)
- [ ] Remove skill_level from users
- [ ] Add new stat columns
- [ ] Create categories table
- [ ] Create registrations table
- [ ] Update matches table
- [ ] Create indexes

### Phase 2: Models (1.5 hours)
- [ ] Update User model
- [ ] Remove skill references
- [ ] Add new stat fields
- [ ] Update validation

### Phase 3: Frontend (2.5 hours)
- [ ] Remove skill from signup
- [ ] Update player profile
- [ ] Update tournament list
- [ ] Update tournament details
- [ ] Remove skill filters

### Phase 4: API (1.5 hours)
- [ ] Update tournament queries
- [ ] Update player queries
- [ ] Remove skill filters
- [ ] Add category support

### Phase 5: Testing (1 hour)
- [ ] Test signup flow
- [ ] Test tournament creation
- [ ] Test registration
- [ ] Test stats calculation

---

## Expected Results

### System Changes
- ✅ No skill levels anywhere
- ✅ Multi-category tournaments
- ✅ Payment-gated registrations
- ✅ Objective player stats
- ✅ Streak tracking

### User Experience
- ✅ Simpler signup
- ✅ Fairer competition
- ✅ Better tournament discovery
- ✅ Transparent stats

---

## Success Criteria

- ✅ Skill level completely removed
- ✅ Categories working
- ✅ Registrations working
- ✅ Stats calculating correctly
- ✅ Streaks tracking correctly
- ✅ No skill references in code
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Database updates: 2 hours
- Model updates: 1.5 hours
- Frontend updates: 2.5 hours
- API updates: 1.5 hours
- Testing: 1 hour
- Buffer: 0 hours

**Total: 8 hours**

---

## Next Steps (Day 33+)

- Payment integration
- Doubles partner selection
- Advanced tournament features
- Performance optimization

---

**Status:** 🚀 Ready to execute  
**Date:** December 30, 2024  
**Duration:** 8 hours  
**Next:** Day 33+ - Payment Integration
