# Day 34: Database Migration & Skill Level Removal Implementation

**Date:** January 1, 2025  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Implement database changes and remove skill level references from codebase

---

## Overview

Day 34 implements the database migrations and code changes to complete the skill level removal system redesign that was architecturally planned in Day 32. This includes updating the database schema, removing skill level references from the codebase, and implementing the new objective stats-based player representation.

---

## Part 1: Database Schema Updates (2 hours)

### 1.1 Users Table Migration
Remove skill level and add objective stats:

```sql
-- Remove skill_level column
ALTER TABLE users DROP COLUMN IF EXISTS skill_level;

-- Add new objective stats columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_participated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournaments_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_tournament_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing data
UPDATE users SET 
  losses = GREATEST(0, matches_played - wins),
  last_active_date = CURRENT_TIMESTAMP
WHERE losses IS NULL;
```

### 1.2 Categories Table Creation
Create the categories table for multi-category tournaments:

```sql
CREATE TABLE IF NOT EXISTS categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('singles', 'doubles', 'mixed_doubles')),
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money_winner DECIMAL(10,2) DEFAULT 0,
  prize_money_runner_up DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  format VARCHAR(20) NOT NULL CHECK (format IN ('knockout', 'league', 'group_knockout')),
  points_per_game INTEGER DEFAULT 21,
  best_of INTEGER DEFAULT 1 CHECK (best_of IN (1, 3, 5)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_tournament_id ON categories(tournament_id);
CREATE INDEX idx_categories_match_type ON categories(match_type);
```

### 1.3 Category Participants Table
Create table to track category registrations:

```sql
CREATE TABLE IF NOT EXISTS category_participants (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  partner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  partner_name VARCHAR(100),
  partner_email VARCHAR(255),
  partner_phone VARCHAR(15),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_id VARCHAR(255),
  registration_status VARCHAR(20) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'cancelled', 'withdrawn')),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, player_id)
);

CREATE INDEX idx_category_participants_category_id ON category_participants(category_id);
CREATE INDEX idx_category_participants_player_id ON category_participants(player_id);
CREATE INDEX idx_category_participants_payment_status ON category_participants(payment_status);
```

---

## Part 2: Backend API Updates (3 hours)

### 2.1 Remove Skill Level from User APIs
Update user controller and routes to remove skill level references:

- Remove skill_level from signup/registration
- Remove skill_level from profile updates
- Remove skill_level from user queries
- Add new stats fields to user responses

### 2.2 Implement Category APIs
Create category management endpoints:

```javascript
// Category CRUD operations
POST   /tournaments/:tournamentId/categories
GET    /tournaments/:tournamentId/categories
GET    /categories/:categoryId
PATCH  /categories/:categoryId
DELETE /categories/:categoryId

// Category registration
POST   /categories/:categoryId/register
DELETE /categories/:categoryId/leave
GET    /categories/:categoryId/participants
```

### 2.3 Update Tournament APIs
Modify tournament endpoints to work with categories:

- Remove old match_type, entry_fee from tournament creation
- Add category support to tournament responses
- Update tournament listing to show category counts

---

## Part 3: Frontend Updates (2.5 hours)

### 3.1 Remove Skill Level from UI
Update all frontend components to remove skill level:

- Remove from signup/onboarding flow
- Remove from profile editing
- Remove from tournament filtering
- Remove from player display components

### 3.2 Update Player Profile Display
Implement new objective stats display:

- Show matches played, wins, losses, win rate
- Show tournament participation stats
- Show current and best streaks
- Show member since date and activity

### 3.3 Update Tournament Components
Modify tournament components for categories:

- Update tournament creation to add categories
- Update tournament display to show categories
- Update registration flow to work with categories

---

## Part 4: Data Migration Scripts (1.5 hours)

### 4.1 Migrate Existing Tournaments
Create script to convert existing tournaments to category-based:

```javascript
// For each existing tournament:
// 1. Create a default category based on tournament match_type
// 2. Move participants to category_participants table
// 3. Update matches to reference category_id
```

### 4.2 Calculate Historical Stats
Update user stats based on existing match data:

```javascript
// For each user:
// 1. Calculate tournaments_participated from match history
// 2. Calculate current_streak from recent matches
// 3. Calculate best_streak from all matches
// 4. Set first_tournament_date from earliest match
```

---

## Part 5: Testing & Validation (1 hour)

### 5.1 Database Testing
- Verify all migrations run successfully
- Test foreign key constraints
- Verify data integrity after migration

### 5.2 API Testing
- Test all category endpoints
- Test updated user endpoints
- Test tournament creation with categories

### 5.3 Frontend Testing
- Test signup flow without skill level
- Test profile display with new stats
- Test tournament browsing and registration

---

## Implementation Checklist

### Phase 1: Database (2 hours)
- [ ] Create migration files
- [ ] Update users table schema
- [ ] Create categories table
- [ ] Create category_participants table
- [ ] Run data migration scripts
- [ ] Verify data integrity

### Phase 2: Backend (3 hours)
- [ ] Update user controller (remove skill_level)
- [ ] Create category controller
- [ ] Update tournament controller
- [ ] Add category routes
- [ ] Update authentication middleware
- [ ] Test all endpoints

### Phase 3: Frontend (2.5 hours)
- [ ] Update signup components
- [ ] Update profile components
- [ ] Update tournament components
- [ ] Remove skill level filters
- [ ] Add category support
- [ ] Test user flows

### Phase 4: Migration (1.5 hours)
- [ ] Create tournament migration script
- [ ] Create stats calculation script
- [ ] Run migration scripts
- [ ] Verify migrated data

### Phase 5: Testing (1 hour)
- [ ] Test database integrity
- [ ] Test API endpoints
- [ ] Test frontend flows
- [ ] Verify no skill level references remain

---

## Expected Results

### Database Schema
- ✅ Users table updated with objective stats
- ✅ Categories table created and functional
- ✅ Category participants table tracking registrations
- ✅ All skill level references removed

### Backend APIs
- ✅ Category management endpoints working
- ✅ User APIs updated without skill levels
- ✅ Tournament APIs supporting categories
- ✅ Registration flow using categories

### Frontend UI
- ✅ Signup flow without skill level selection
- ✅ Profile showing objective stats
- ✅ Tournament browsing by categories
- ✅ Registration flow using categories

### Data Migration
- ✅ Existing tournaments converted to categories
- ✅ User stats calculated from match history
- ✅ All data integrity maintained

---

## Success Criteria

- ✅ No skill_level references in database
- ✅ No skill_level references in code
- ✅ Category system fully functional
- ✅ User stats display objective metrics
- ✅ Tournament creation uses categories
- ✅ Registration flow works with categories
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Database migrations: 2 hours
- Backend API updates: 3 hours
- Frontend updates: 2.5 hours
- Data migration: 1.5 hours
- Testing & validation: 1 hour

**Total: 10 hours**

---

## Next Steps (Day 35+)

- Enhanced category management UI
- Advanced player statistics
- Tournament analytics
- Performance optimizations
- Mobile app considerations

---

**Status:** 🚀 Ready to execute  
**Date:** January 1, 2025  
**Duration:** 10 hours  
**Next:** Day 35+ - Enhanced Features
