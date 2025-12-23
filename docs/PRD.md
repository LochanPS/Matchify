# Pathfinder Enhanced - Product Design Document

## Badminton Tournament Management Platform (MVP)

---

# Executive Summary

Pathfinder Enhanced is a mobile-first web application designed to simplify badminton tournament organization and player participation in India. The platform bridges the gap between players seeking competitive opportunities and organizers managing local tournaments.

This MVP focuses exclusively on badminton, targeting local tournaments, academies, and clubs with a streamlined, mobile-optimized experience that eliminates the complexity of existing solutions.

---

# Product Vision & Goals

## Vision

To become the go-to platform for grassroots badminton tournament management in India, making organized competitive play accessible to every player regardless of location or skill level.

## MVP Goals

1. Enable organizers to create and manage tournaments in under 5 minutes
2. Allow players to discover and join tournaments with 3 taps or less
3. Automate match scheduling and bracket management
4. Track player statistics automatically without manual data entry
5. Achieve 90% mobile usage with fast load times under 3 seconds

---

# Target Users

## Primary User: Players

### Demographics
- Age 16-45, predominantly male (expanding to include female players)
- Urban and semi-urban areas (Tier 1 and Tier 2 cities)
- Students, working professionals, and enthusiasts
- Beginner to advanced skill levels

### Pain Points
- Difficulty finding tournaments matching their skill level
- Manual registration via WhatsApp groups or phone calls
- Lack of transparency around match schedules and results
- No centralized way to track performance history

### Needs
- Quick tournament discovery with skill-level filtering
- One-tap registration with automatic confirmation
- Real-time match schedules and bracket visibility
- Personal stats dashboard showing wins, matches played, and tournament history

## Secondary User: Organizers

### Demographics
- Badminton coaches and academy owners
- Sports club administrators
- Community tournament organizers
- Age 25-55, managing 5-50 tournaments per year

### Pain Points
- Manual bracket creation using Excel or paper
- Spreadsheet management for player registrations
- Repeated calls and messages to confirm attendance
- Time-consuming score entry and winner calculations
- Difficulty marketing tournaments to reach enough players

### Needs
- Quick tournament setup with pre-filled templates
- Automatic bracket generation based on format selection
- Simple score entry interface optimized for mobile
- Player discovery platform to fill tournament slots faster
- Dashboard showing all tournaments and their status at a glance

---

# App Architecture

## Technology Stack Recommendation

| Component | Technology & Rationale |
|-----------|------------------------|
| **Frontend** | React.js with Vite - Fast build times, excellent mobile performance, component reusability |
| **Mobile UI** | Tailwind CSS + Shadcn UI - Mobile-first utility classes, pre-built accessible components, small bundle size |
| **Backend** | Node.js + Express.js - JavaScript full-stack, lightweight, large ecosystem |
| **Database** | PostgreSQL - Relational data with excellent relationships support, ACID compliance, free tier on Railway/Supabase |
| **Authentication** | Firebase Auth - Easy email authentication, secure token management, no backend auth complexity |
| **Hosting** | Vercel (Frontend) + Railway (Backend) - Zero-config deployment, automatic HTTPS, generous free tiers |

## Architecture Diagram (Conceptual)

- Mobile Browser makes HTTPS requests to React App hosted on Vercel
- React App authenticates users via Firebase Auth
- React App calls REST API endpoints on Express.js backend hosted on Railway
- Express.js Backend validates Firebase tokens and queries PostgreSQL database
- PostgreSQL stores all user, tournament, participant, and match data

## Key Architecture Principles

1. **Mobile-First**: All components designed for touch, tested on viewport widths 360px-414px
2. **API-First**: RESTful API design enables future mobile app development
3. **Stateless Backend**: JWT tokens for authentication, no server-side sessions
4. **Optimistic UI**: Instant feedback on user actions with background sync
5. **Progressive Enhancement**: Core features work without JavaScript, enhanced with React

---

# Database Schema

## Entity Relationship Overview

The database uses four primary tables with clear relationships to avoid data duplication and maintain referential integrity.

## Table: users

Stores all user accounts with role-based differentiation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY | Unique identifier |
| firebase_uid | VARCHAR(255) | UNIQUE, NOT NULL | Firebase Auth UID |
| name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| city | VARCHAR(100) | NOT NULL | User's city |
| role | ENUM | 'player', 'organizer' | User role |
| skill_level | ENUM | NULL if organizer | 'beginner', 'intermediate', 'advanced' (player only) |
| matches_played | INTEGER | DEFAULT 0 | Total matches |
| wins | INTEGER | DEFAULT 0 | Total wins |
| organizer_contact | VARCHAR(15) | NULL if player | Organizer phone |
| created_at | TIMESTAMP | DEFAULT NOW() | Account created |

## Table: tournaments

Stores tournament information with foreign key to organizer.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| tournament_id | UUID | PRIMARY KEY | Unique identifier |
| organizer_id | UUID | FOREIGN KEY | References users.user_id |
| tournament_name | VARCHAR(200) | NOT NULL | Tournament name |
| venue | VARCHAR(200) | NOT NULL | Venue address |
| tournament_date | DATE | NOT NULL | Tournament date |
| match_type | ENUM | 'singles', 'doubles' | Match type |
| format | ENUM | 'knockout', 'league' | Tournament format |
| entry_fee | DECIMAL(10,2) | DEFAULT 0 | Entry fee in INR |
| prize_money | DECIMAL(10,2) | DEFAULT 0 | Prize in INR |
| max_players | INTEGER | NOT NULL | Max participants |
| current_players | INTEGER | DEFAULT 0 | Joined count |
| status | ENUM | 'upcoming', 'live', 'completed' | Tournament status |
| created_at | TIMESTAMP | DEFAULT NOW() | Created date |

## Table: participants

Junction table linking players to tournaments they've joined.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| participant_id | UUID | PRIMARY KEY | Unique identifier |
| tournament_id | UUID | FOREIGN KEY | References tournaments.tournament_id |
| player_id | UUID | FOREIGN KEY | References users.user_id |
| joined_at | TIMESTAMP | DEFAULT NOW() | Registration time |

**Constraint**: UNIQUE(tournament_id, player_id) - Prevents duplicate registrations

## Table: matches

Stores individual match information with players and scores.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| match_id | UUID | PRIMARY KEY | Unique identifier |
| tournament_id | UUID | FOREIGN KEY | References tournaments.tournament_id |
| player1_id | UUID | FOREIGN KEY | First player (references users.user_id) |
| player2_id | UUID | FOREIGN KEY | Second player (references users.user_id) |
| round | VARCHAR(50) | NOT NULL | Round name (e.g., "Quarterfinals", "Match Day 1") |
| player1_score | INTEGER | NULL | Player 1 score |
| player2_score | INTEGER | NULL | Player 2 score |
| winner_id | UUID | FOREIGN KEY, NULL | Match winner (references users.user_id) |
| match_status | ENUM | 'scheduled', 'completed' | Match status |
| created_at | TIMESTAMP | DEFAULT NOW() | Match created |

## Key Relationships & Constraints

1. Users can be either players OR organizers (enforced by role enum)
2. Tournaments are created by organizers (foreign key: organizer_id → users.user_id)
3. Participants link players to tournaments (many-to-many relationship)
4. Matches belong to tournaments and reference two players
5. Cascade deletes: If tournament deleted → all participants and matches deleted
6. Indexes on foreign keys and email for fast lookups

---

# Screen-by-Screen Flow

## 1. Authentication Flow

### Screen: Login/Signup

**Purpose**: User authentication and role selection

**Elements**:
- Email input field (full-width, rounded corners)
- Password input field (show/hide toggle)
- Two large role selection buttons: 'Player' and 'Organizer'
- Primary action button: 'Continue' (60px height, bold text)
- Secondary link: 'Already have an account? Login'

**User Actions**:
- Selects role → Enters email and password → Submits
- Firebase Auth creates account and returns JWT token

**Backend Logic**:
- Verify Firebase token → Create user record in PostgreSQL with selected role
- If role is Player, prompt for skill level and city before proceeding

**Next Screen**:
- Player → Home (tournament list)
- Organizer → Organizer Dashboard

## 2. Player Flow

### Screen: Home (Tournament List)

**Purpose**: Browse available tournaments

**Elements**:
- Top navigation: Logo, Profile icon, Logout
- Filter chips: All, Singles, Doubles, By City
- Tournament cards showing:
  - Tournament name
  - Date and venue
  - Slots filled (e.g., "8/16 players")
  - Entry fee and prize money
  - "View Details" button
- Pull-to-refresh for latest tournaments

**API Call**: `GET /tournaments?status=upcoming&city=[user_city]`

**User Actions**:
- Applies filters → Views filtered list
- Taps tournament card → Goes to Tournament Details

### Screen: Tournament Details

**Purpose**: View full tournament information and join

**Elements**:
- Tournament name (large heading)
- Date, venue, match type, format
- Entry fee, prize money
- Slots: "8/16 players joined" with progress bar
- Organizer details: Name, contact info
- List of joined players (names only)
- Primary CTA: "Join Tournament" button (sticky at bottom)
- Secondary link: "View Bracket" (if tournament status is live)

**API Calls**:
- `GET /tournaments/:id` (tournament details)
- `GET /tournaments/:id/participants` (list of joined players)

**User Actions**:
- Taps "Join Tournament" → Confirmation modal appears → Confirms → Joined

**Backend Logic**:
- `POST /tournaments/:id/join`
- Check if tournament is full → Check if player already joined
- Create participant record → Increment current_players count
- Return success message

### Screen: Player Profile

**Purpose**: View player stats and tournament history

**Elements**:
- Player name and city
- Skill level badge
- Stats cards:
  - Matches Played
  - Wins
  - Win Rate (calculated)
  - Tournament history list:
    - Tournament name
    - Date
    - Placement (Winner, Runner-up, Participated)
- Edit profile button

**API Call**: `GET /users/:id/profile`

**Next Screen**: Edit Profile (if user taps edit button)

## 3. Organizer Flow

### Screen: Organizer Dashboard

**Purpose**: Manage all tournaments

**Elements**:
- Top navigation: Logo, Profile icon, Logout
- Large "Create Tournament" button (floating action button, bottom-right)
- Tabs: Upcoming, Live, Completed
- Tournament cards with:
  - Tournament name and date
  - Player count
  - Quick actions: View, Edit, Enter Scores

**API Call**: `GET /organizers/:id/tournaments`

**User Actions**:
- Taps "Create Tournament" → Goes to Create Tournament screen
- Taps tournament card → Goes to Tournament Management screen

### Screen: Create Tournament

**Purpose**: Set up new tournament

**Elements** (form with large input fields):
- Tournament Name (text input)
- Venue (text input)
- Date (date picker)
- Match Type (radio buttons: Singles / Doubles)
- Format (radio buttons: Knockout / League)
- Entry Fee (number input, INR)
- Prize Money (number input, INR)
- Max Players (dropdown: 8, 16, 32)
- Primary button: "Create Tournament" (full-width, 60px height)

**Validation**:
- All fields required except entry fee and prize money
- Date must be in the future

**API Call**: `POST /tournaments`

**Backend Logic**:
- Validate organizer role → Create tournament record
- Set status to 'upcoming', current_players to 0

**Next Screen**: Organizer Dashboard with success message

### Screen: Tournament Management

**Purpose**: View participants, generate matches, enter scores

**Elements**:
- Tournament details at top
- Tabs: Participants, Matches, Results
- Action buttons:
  - "Generate Matches" (if no matches exist)
  - "Start Tournament" (changes status to 'live')

**Participants Tab**:
- List of joined players with:
  - Name
  - Skill level
  - Join date

**Matches Tab**:
- Match cards grouped by round
- Each card shows:
  - Player 1 vs Player 2
  - Score inputs (number fields)
  - "Submit Score" button
  - Completed matches show final scores and winner highlighted

**Results Tab**:
- Tournament winner and runner-up (if tournament completed)
- Full match history

**User Actions**:
- Taps "Generate Matches" → Backend creates matches based on format
- Enters scores for each match → Taps "Submit Score"

**Backend Logic**:

**Generate Matches** (`POST /tournaments/:id/generate-matches`):
- If Knockout:
  - Create bracket with rounds based on player count
  - Round names: Round of 16, Quarterfinals, Semifinals, Finals
  - Randomly assign players to initial matches
  - Create placeholder matches for winners to advance
- If League:
  - Create round-robin matches where each player plays everyone
  - Match days: Match Day 1, Match Day 2, etc.

**Submit Score** (`PATCH /matches/:id/score`):
- Validate organizer owns this tournament
- Update player1_score and player2_score
- Determine winner (higher score)
- Update winner_id and match_status to 'completed'
- Update both players' matches_played count (+1)
- Update winner's wins count (+1)
- If Knockout: Advance winner to next round match
- If League: Check if all matches complete → Determine tournament winner by total wins

---

# Core Logic Explained

## Tournament Creation Logic

1. Organizer fills form with all tournament details
2. System validates data (date in future, max players is 8/16/32)
3. New tournament record created with status = 'upcoming'
4. Tournament appears on home screen for players to discover

## Player Registration Logic

1. Player browses tournaments and taps "Join"
2. System checks:
   - Is tournament full? (current_players < max_players)
   - Has player already joined? (check participants table)
3. If valid:
   - Create participant record
   - Increment tournament.current_players
   - Show success message
4. If invalid:
   - Show error: "Tournament full" or "Already joined"

## Match Generation Logic

### Knockout Format:

1. Get all participants for the tournament
2. Determine bracket size based on max_players (8, 16, or 32)
3. Randomly shuffle participants
4. Create initial round matches pairing participants sequentially
5. For each subsequent round, create placeholder matches
6. Match structure example (16 players):
   - Round of 16: 8 matches
   - Quarterfinals: 4 matches
   - Semifinals: 2 matches
   - Finals: 1 match

### League Format (Round-Robin):

1. Get all participants
2. For each unique pair of players, create a match
3. Formula: Total matches = n(n-1)/2 where n = number of players
4. Assign matches to "Match Day 1", "Match Day 2", etc.
5. No elimination - all players play all matches

## Score Entry & Winner Advancement Logic

1. Organizer enters scores for a match
2. System compares scores and determines winner
3. Update match record:
   - Set player1_score and player2_score
   - Set winner_id to player with higher score
   - Change match_status from 'scheduled' to 'completed'
4. Update player statistics:
   - Both players: matches_played += 1
   - Winner: wins += 1
5. **Knockout Specific**: Find next round match where winner should advance:
   - Update next match's player1_id or player2_id with winner_id
6. **League Specific**: After all matches completed:
   - Calculate total wins for each player
   - Player with most wins is tournament winner

## Player Stats Calculation

**Automatic Updates**:
- matches_played: Incremented every time a match they're in is completed
- wins: Incremented when they are set as winner_id in a completed match
- Win rate: Calculated on-the-fly as (wins / matches_played) * 100

**No Manual Entry Required**: All stats update automatically when organizers submit match scores

---

# Mobile UX Optimization Guidelines

## Design Principles

1. **Touch-First Interface**:
   - All buttons minimum 48x48px (iOS/Android guideline)
   - Spacing between tappable elements: minimum 8px
   - Primary CTAs: 60px height for easy thumb reach
   - Large input fields: 56px height for comfortable typing

2. **Thumb-Friendly Navigation**:
   - Bottom navigation for main tabs (Player/Organizer)
   - Floating action button for primary action (Create Tournament)
   - Sticky "Join" button at bottom of tournament details
   - Back button always in top-left corner

3. **Performance Optimization**:
   - Lazy load tournament images
   - Infinite scroll with pagination (20 tournaments per page)
   - Optimistic UI updates (show changes immediately, sync in background)
   - Aggressive caching of tournament list and user profile

4. **Responsive Typography**:
   - Headings: 24-28px (easily scannable)
   - Body text: 16-18px (readable without zoom)
   - Labels: 14px (sufficient for metadata)
   - Minimum contrast ratio: 4.5:1 for all text

5. **Visual Hierarchy**:
   - Use color to indicate status:
     - Green: Upcoming tournaments, available slots
     - Blue: Primary actions
     - Gray: Completed tournaments, disabled states
     - Red: Errors, full tournaments
   - Card-based layout with subtle shadows
   - Clear sectioning with whitespace

6. **Minimizing Friction**:
   - Auto-fill city from user profile in tournament filters
   - Remember filter preferences
   - One-tap join with confirmation modal (not multi-step form)
   - Pull-to-refresh on all list screens
   - Skeleton screens while loading (not blank states)

7. **Error Handling**:
   - Inline validation for form fields (show errors below field)
   - Toast notifications for success/error messages (auto-dismiss in 3s)
   - Clear error messages in user language (not technical jargon)
   - Retry buttons for failed network requests

8. **Accessibility**:
   - Semantic HTML (proper heading hierarchy)
   - ARIA labels for icons and buttons
   - Focus indicators for keyboard navigation
   - Color not the only indicator of state (use icons too)

---

# API Endpoints Reference

## Authentication

- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate existing user

## Tournaments (Public)

- `GET /tournaments` - List all upcoming tournaments (with filters)
- `GET /tournaments/:id` - Get tournament details
- `GET /tournaments/:id/participants` - List participants
- `GET /tournaments/:id/matches` - Get tournament bracket/matches

## Player Actions

- `POST /tournaments/:id/join` - Join a tournament
- `GET /users/:id/profile` - Get player profile and stats
- `PATCH /users/:id/profile` - Update player profile

## Organizer Actions

- `POST /tournaments` - Create new tournament
- `GET /organizers/:id/tournaments` - List organizer's tournaments
- `PATCH /tournaments/:id` - Update tournament details
- `POST /tournaments/:id/generate-matches` - Generate matches
- `PATCH /tournaments/:id/status` - Update tournament status
- `PATCH /matches/:id/score` - Submit match score

---

# MVP Improvements & Suggestions

## 1. Smart Tournament Discovery

**Problem**: Players may miss tournaments matching their skill level

**Solution**: Implement skill-based recommendations
- Show "Recommended for You" section on home screen
- Algorithm: Match player's skill_level with tournament difficulty (inferred from past participants)
- Highlight tournaments in user's city first
- Show distance to venue (if location permission granted)

## 2. Quick Registration Flow

**Problem**: Even one modal can feel like friction on mobile

**Solution**: Add "Express Join" for verified players
- First-time join: Show modal with confirmation
- Subsequent joins: Single tap with undo option (3-second window)
- Toast notification: "Joined! Tap to undo"

## 3. Live Score Updates

**Problem**: Players don't know when matches start or results

**Solution**: Add real-time status to tournament details
- WebSocket connection for live tournaments
- Show "Match in Progress" indicator
- Update scores in real-time as organizer enters them
- Push notification when player's next match is ready (future)

## 4. Organizer Templates

**Problem**: Creating tournaments from scratch is repetitive

**Solution**: Save tournament as template
- "Create from Previous Tournament" button
- Copies all settings except date and name
- Templates library: "Weekly Singles Tournament", "Monthly Championship"

## 5. Automated Reminders

**Problem**: Players forget about upcoming tournaments

**Solution**: Email reminders (no SMS to avoid costs)
- 1 day before tournament: "Your tournament is tomorrow!"
- Morning of tournament: "Tournament starts today at [venue]"
- Include organizer contact and venue map link

## 6. Payment Integration (Post-MVP)

**Future Feature**: UPI payment collection
- Razorpay or PhonePe integration
- Player pays entry fee during join process
- Organizer receives payout after tournament completes
- Platform takes 5% transaction fee

## 7. Leaderboards & Rankings

**Future Feature**: City-wide and national rankings
- Rank players by win rate (minimum 5 matches)
- City leaderboards: Encourage local competition
- National leaderboard: Top 100 players
- Achievement badges: "5 Tournament Winner", "50 Matches Played"

## 8. Social Sharing

**Problem**: Tournaments need more visibility

**Solution**: One-tap sharing
- "Share Tournament" button generates WhatsApp-ready message
- Message includes: Tournament name, date, venue, slots available, join link
- Organizers can share to their academy WhatsApp groups
- Players can share with friends

## 9. Dispute Resolution

**Problem**: Score disputes can arise

**Solution**: Comment system on matches
- Players can comment on their match
- Organizer reviews and responds
- Flag system for serious disputes
- Admin review for flagged matches (post-MVP)

## 10. Multi-Language Support

**Problem**: Many Indian users prefer regional languages

**Solution**: Add Hindi and one regional language (e.g., Kannada for Bangalore)
- Language selector in profile
- Translate all UI strings
- Organizers can write tournament details in their language
- Auto-detect browser language on first visit

---

# Success Metrics (KPIs)

## User Acquisition

- Target: 100 players and 10 organizers in first month
- Target: 500 players and 50 organizers in first quarter

## Engagement

- Active players: % of registered players who join at least 1 tournament per month (Target: 40%)
- Active organizers: % of registered organizers who create at least 1 tournament per month (Target: 60%)
- Average sessions per week per user (Target: 2-3)

## Tournament Success Rate

- Tournament completion rate: % of created tournaments that are completed (Target: 80%)
- Average time to fill tournament slots (Target: < 7 days for 16-player tournament)

## Platform Health

- Average page load time (Target: < 2 seconds)
- API response time (Target: < 500ms for 95th percentile)
- Mobile usage percentage (Target: > 90%)
- Crash-free rate (Target: > 99.5%)

## User Satisfaction

- Player satisfaction: Post-tournament survey rating (Target: > 4/5)
- Organizer satisfaction: Post-tournament survey rating (Target: > 4.5/5)
- Net Promoter Score (NPS) (Target: > 30)

---

# Risk Assessment & Mitigation

## Technical Risks

**Risk**: Database scalability as tournaments grow
- **Mitigation**: PostgreSQL handles 10K+ tournaments easily; use read replicas if needed; partition large tables

**Risk**: Real-time updates overload for live tournaments
- **Mitigation**: Use WebSockets only for active tournament pages; fall back to polling every 30s

**Risk**: Mobile network issues in venues (poor connectivity)
- **Mitigation**: Implement offline-first architecture for score entry; queue updates and sync when online

## Business Risks

**Risk**: Low organizer adoption (chicken-and-egg problem)
- **Mitigation**: Partner with 5-10 local academies pre-launch; onboard them personally; offer free support for first 3 months

**Risk**: Players prefer WhatsApp groups (habit resistance)
- **Mitigation**: Emphasize pain points: "Track your stats", "Never miss a tournament"; integrate WhatsApp sharing

**Risk**: Revenue model unclear (MVP is free)
- **Mitigation**: Focus on PMF first; monetize via: (1) Entry fee processing (5% fee), (2) Premium organizer features, (3) Sponsored tournaments

## Operational Risks

**Risk**: Disputes between players and organizers
- **Mitigation**: Clear terms of service; dispute resolution process; admin review system (manual for MVP)

**Risk**: Fake accounts or no-shows
- **Mitigation**: Require phone verification (OTP) after 1st tournament join; reputation system (future)

**Risk**: Scalability of manual match generation
- **Mitigation**: Match generation is automated; score entry is only manual part (acceptable for MVP)

---

# Conclusion

Pathfinder Enhanced solves real pain points for both players and organizers in the grassroots badminton community. By focusing relentlessly on mobile UX, automation, and simplicity, we can create a product that users choose over existing manual processes.

The MVP scope is deliberately narrow (badminton only, basic features) to enable rapid development and validation. Success in this niche positions us to expand to:
- Other racquet sports (tennis, squash)
- Other sports formats (cricket, football)
- Geographic expansion beyond India
- Advanced features (payments, rankings, social features)

The key to success is launching quickly, gathering real user feedback, and iterating based on actual behavior rather than assumptions. This document provides a solid foundation to build, test, and scale Pathfinder Enhanced.

**Document Version**: 1.0
**Last Updated**: December 2024
**Next Review**: After Beta Testing Completion
