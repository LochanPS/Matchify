# Frontend API Integration Guide

**Date:** December 18, 2024  
**Status:** Complete  
**Location:** `frontend/src/services/api.js`

---

## Overview

The API service layer provides a centralized, type-safe interface for all backend API calls. It handles authentication, error handling, and token management automatically.

---

## Quick Start

### Import the API Service

```javascript
import { authAPI, userAPI, tournamentAPI, participantAPI, matchAPI, scoreAPI } from '../services/api';
```

### Basic Usage

```javascript
// Signup
const user = await authAPI.signup('user@example.com', 'password123', 'player');

// Login
const user = await authAPI.login('user@example.com', 'password123');

// Get tournaments
const tournaments = await tournamentAPI.list({ status: 'upcoming', city: 'Bangalore' });

// Join tournament
await participantAPI.join(tournamentId);
```

---

## API Reference

### Authentication APIs

#### `authAPI.signup(email, password, role)`
Create a new user account.

**Parameters:**
- `email` (string): User email address
- `password` (string): User password (min 6 chars)
- `role` (string): 'player' or 'organizer'

**Returns:**
```javascript
{
  user_id: "string",
  email: "string",
  token: "string",
  role: "player|organizer",
  name: "string",
  skill_level: null,
  city: null,
  onboarded: false
}
```

**Example:**
```javascript
try {
  const user = await authAPI.signup('player@example.com', 'password123', 'player');
  console.log('Account created:', user.email);
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

---

#### `authAPI.login(email, password)`
Login with email and password.

**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:**
```javascript
{
  user_id: "string",
  email: "string",
  token: "string",
  role: "player|organizer",
  name: "string",
  skill_level: "beginner|intermediate|advanced",
  city: "string",
  onboarded: true|false
}
```

**Example:**
```javascript
try {
  const user = await authAPI.login('player@example.com', 'password123');
  console.log('Logged in as:', user.email);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

---

#### `authAPI.logout()`
Clear authentication token.

**Example:**
```javascript
authAPI.logout();
// Token cleared from localStorage
```

---

### User APIs

#### `userAPI.getProfile(userId)`
Get user profile information.

**Parameters:**
- `userId` (string): User ID

**Returns:**
```javascript
{
  user_id: "string",
  email: "string",
  name: "string",
  role: "player|organizer",
  skill_level: "beginner|intermediate|advanced",
  city: "string",
  matches_played: 0,
  matches_won: 0,
  win_rate: 0,
  created_at: "2024-12-18T10:00:00Z"
}
```

**Example:**
```javascript
const profile = await userAPI.getProfile(userId);
console.log('Player skill level:', profile.skill_level);
```

---

#### `userAPI.updateProfile(userId, profileData)`
Update user profile (requires authentication).

**Parameters:**
- `userId` (string): User ID
- `profileData` (object): Profile fields to update
  - `skill_level` (string): 'beginner', 'intermediate', or 'advanced'
  - `city` (string): City name

**Returns:** Updated user object

**Example:**
```javascript
const updated = await userAPI.updateProfile(userId, {
  skill_level: 'intermediate',
  city: 'Bangalore'
});
console.log('Profile updated:', updated);
```

---

#### `userAPI.getStats(userId)`
Get player statistics.

**Parameters:**
- `userId` (string): User ID

**Returns:**
```javascript
{
  user_id: "string",
  matches_played: 10,
  matches_won: 7,
  win_rate: 70,
  tournaments_joined: 3,
  tournaments_won: 1
}
```

**Example:**
```javascript
const stats = await userAPI.getStats(userId);
console.log('Win rate:', stats.win_rate + '%');
```

---

### Tournament APIs

#### `tournamentAPI.list(filters)`
Get list of tournaments with optional filters.

**Parameters:**
- `filters` (object): Optional filters
  - `status` (string): 'upcoming', 'live', or 'completed'
  - `city` (string): Filter by city
  - `match_type` (string): 'singles' or 'doubles'
  - `format` (string): 'knockout' or 'league'
  - `date_from` (string): Start date (YYYY-MM-DD)
  - `date_to` (string): End date (YYYY-MM-DD)
  - `limit` (number): Results per page (default: 20)
  - `offset` (number): Pagination offset (default: 0)

**Returns:**
```javascript
[
  {
    tournament_id: "string",
    name: "string",
    description: "string",
    organizer_id: "string",
    organizer_name: "string",
    date: "2024-12-25",
    venue: "string",
    city: "string",
    match_type: "singles|doubles",
    format: "knockout|league",
    max_players: 16,
    current_players: 8,
    entry_fee: 500,
    prize_money: 5000,
    status: "upcoming|live|completed",
    created_at: "2024-12-18T10:00:00Z"
  }
]
```

**Example:**
```javascript
// Get upcoming tournaments in Bangalore
const tournaments = await tournamentAPI.list({
  status: 'upcoming',
  city: 'Bangalore',
  limit: 10
});

// Get all tournaments
const allTournaments = await tournamentAPI.list();
```

---

#### `tournamentAPI.getById(tournamentId)`
Get tournament details.

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:** Tournament object (same as list)

**Example:**
```javascript
const tournament = await tournamentAPI.getById(tournamentId);
console.log('Tournament:', tournament.name);
```

---

#### `tournamentAPI.create(tournamentData)`
Create a new tournament (organizer only).

**Parameters:**
- `tournamentData` (object):
  - `name` (string): Tournament name
  - `description` (string): Tournament description
  - `date` (string): Tournament date (YYYY-MM-DD)
  - `venue` (string): Venue name
  - `city` (string): City name
  - `match_type` (string): 'singles' or 'doubles'
  - `format` (string): 'knockout' or 'league'
  - `max_players` (number): 8, 16, or 32
  - `entry_fee` (number): Entry fee in rupees
  - `prize_money` (number): Prize pool in rupees

**Returns:** Created tournament object

**Example:**
```javascript
const tournament = await tournamentAPI.create({
  name: 'City Championship 2024',
  description: 'Annual badminton championship',
  date: '2024-12-25',
  venue: 'Sports Complex',
  city: 'Bangalore',
  match_type: 'singles',
  format: 'knockout',
  max_players: 16,
  entry_fee: 500,
  prize_money: 5000
});
```

---

#### `tournamentAPI.update(tournamentId, tournamentData)`
Update tournament (organizer only, upcoming tournaments only).

**Parameters:**
- `tournamentId` (string): Tournament ID
- `tournamentData` (object): Fields to update (same as create)

**Returns:** Updated tournament object

---

#### `tournamentAPI.delete(tournamentId)`
Delete tournament (organizer only, upcoming tournaments only).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:** Success message

---

#### `tournamentAPI.getOrganizerTournaments(organizerId)`
Get all tournaments created by an organizer.

**Parameters:**
- `organizerId` (string): Organizer user ID

**Returns:** Array of tournament objects

---

### Participant APIs

#### `participantAPI.join(tournamentId)`
Join a tournament (player only, upcoming tournaments only).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
{
  participant_id: "string",
  tournament_id: "string",
  user_id: "string",
  joined_at: "2024-12-18T10:00:00Z"
}
```

**Example:**
```javascript
try {
  await participantAPI.join(tournamentId);
  console.log('Successfully joined tournament');
} catch (error) {
  if (error.message.includes('already')) {
    console.log('Already joined this tournament');
  }
}
```

---

#### `participantAPI.leave(tournamentId)`
Leave a tournament (player only, upcoming tournaments only).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:** Success message

---

#### `participantAPI.getParticipants(tournamentId)`
Get all participants in a tournament.

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
[
  {
    participant_id: "string",
    user_id: "string",
    name: "string",
    skill_level: "beginner|intermediate|advanced",
    matches_played: 5,
    matches_won: 3,
    win_rate: 60,
    joined_at: "2024-12-18T10:00:00Z"
  }
]
```

---

#### `participantAPI.checkParticipation(tournamentId)`
Check if current user is participant in tournament.

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
{
  is_participant: true|false,
  participant_id: "string|null"
}
```

---

#### `participantAPI.getUserTournaments(userId)`
Get all tournaments joined by a user.

**Parameters:**
- `userId` (string): User ID

**Returns:** Array of tournament objects

---

### Match APIs

#### `matchAPI.generateMatches(tournamentId)`
Generate matches for tournament (organizer only).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
{
  tournament_id: "string",
  matches_count: 15,
  rounds: 4,
  status: "live"
}
```

---

#### `matchAPI.getTournamentMatches(tournamentId)`
Get all matches in a tournament grouped by round.

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
{
  "Finals": [
    {
      match_id: "string",
      player1_id: "string",
      player1_name: "string",
      player2_id: "string",
      player2_name: "string",
      player1_score: null,
      player2_score: null,
      winner_id: null,
      status: "pending|in_progress|completed"
    }
  ],
  "Semi Finals": [ /* ... */ ]
}
```

---

#### `matchAPI.getById(matchId)`
Get match details.

**Parameters:**
- `matchId` (string): Match ID

**Returns:** Match object

---

#### `matchAPI.deleteMatches(tournamentId)`
Delete all matches in tournament (organizer only).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:** Success message

---

### Score APIs

#### `scoreAPI.submitScore(matchId, scoreData)`
Submit match score (organizer only).

**Parameters:**
- `matchId` (string): Match ID
- `scoreData` (object):
  - `player1_score` (number): Player 1 score
  - `player2_score` (number): Player 2 score

**Returns:**
```javascript
{
  match_id: "string",
  player1_score: 21,
  player2_score: 18,
  winner_id: "string",
  status: "completed"
}
```

**Example:**
```javascript
const result = await scoreAPI.submitScore(matchId, {
  player1_score: 21,
  player2_score: 18
});
console.log('Winner:', result.winner_id);
```

---

#### `scoreAPI.getLeaderboard(tournamentId)`
Get tournament leaderboard (league format).

**Parameters:**
- `tournamentId` (string): Tournament ID

**Returns:**
```javascript
[
  {
    rank: 1,
    user_id: "string",
    name: "string",
    matches_played: 5,
    matches_won: 5,
    points: 15,
    total_score: 105
  }
]
```

---

## Error Handling

### Error Structure

```javascript
{
  message: "Error message",
  status: 400,
  data: {
    // Backend error response
  }
}
```

### Common Errors

```javascript
try {
  await tournamentAPI.getById(invalidId);
} catch (error) {
  if (error.status === 404) {
    console.log('Tournament not found');
  } else if (error.status === 401) {
    console.log('Not authenticated');
  } else if (error.status === 403) {
    console.log('Not authorized');
  } else if (error.status === 400) {
    console.log('Invalid request:', error.message);
  }
}
```

---

## Token Management

### Automatic Token Handling

The API service automatically:
1. Retrieves token from localStorage
2. Adds token to Authorization header
3. Stores new tokens after login/signup
4. Clears token on logout

### Manual Token Management

```javascript
import { getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

// Get current token
const token = getAuthToken();

// Set token manually
setAuthToken('new-token');

// Clear token
clearAuthToken();
```

---

## Usage Examples

### Complete User Journey

```javascript
import { authAPI, userAPI, tournamentAPI, participantAPI } from '../services/api';

// 1. Signup
const user = await authAPI.signup('player@example.com', 'password123', 'player');

// 2. Complete profile
await userAPI.updateProfile(user.user_id, {
  skill_level: 'intermediate',
  city: 'Bangalore'
});

// 3. Get tournaments
const tournaments = await tournamentAPI.list({
  status: 'upcoming',
  city: 'Bangalore'
});

// 4. Join tournament
await participantAPI.join(tournaments[0].tournament_id);

// 5. Get participants
const participants = await participantAPI.getParticipants(tournaments[0].tournament_id);

// 6. Logout
authAPI.logout();
```

---

## Best Practices

1. **Always use try-catch** for API calls
2. **Check error status** for specific error handling
3. **Store token** after login/signup
4. **Clear token** on logout
5. **Use filters** to reduce data transfer
6. **Handle loading states** during API calls
7. **Show user-friendly errors** from error.message
8. **Validate input** before API calls

---

## Environment Variables

Create `.env` file in frontend root:

```env
VITE_API_URL=http://localhost:5000
```

Or use default: `http://localhost:5000`

---

## Troubleshooting

### Token Not Persisting
- Check localStorage is enabled
- Verify token is being stored after login
- Check browser console for errors

### API Calls Failing
- Verify backend is running on correct port
- Check VITE_API_URL environment variable
- Verify token is valid
- Check network tab in browser dev tools

### CORS Errors
- Verify backend has CORS enabled
- Check backend CORS configuration
- Verify frontend URL is whitelisted

---

## Future Enhancements

1. Request/response interceptors
2. Automatic token refresh
3. Request caching
4. Retry logic for failed requests
5. Request timeout handling
6. Offline support
7. Request queuing

---

*Last Updated: December 18, 2024*
