# Pathfinder Enhanced API Documentation

Base URL: `http://localhost:5000` (development)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer [your_firebase_token]
```

---

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "idToken": "string (required) - Firebase ID token",
  "name": "string (required, 2-100 chars)",
  "city": "string (required, 2-100 chars)",
  "role": "player | organizer (required)",
  "skill_level": "beginner | intermediate | advanced (required for player)",
  "organizer_contact": "string (required for organizer, 10 digits)"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "city": "string",
    "role": "string",
    "skill_level": "string (player only)",
    "organizer_contact": "string (organizer only)",
    "matches_played": 0,
    "wins": 0,
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or user already exists
- `401 Unauthorized` - Invalid Firebase token
- `500 Internal Server Error` - Server error

---

### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "idToken": "string (required) - Firebase ID token"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "city": "string",
    "role": "string",
    "skill_level": "string (player only)",
    "organizer_contact": "string (organizer only)",
    "matches_played": 0,
    "wins": 0,
    "win_rate": "0.0 (player only)",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing ID token
- `401 Unauthorized` - Invalid Firebase token
- `404 Not Found` - User not found (need to signup)
- `500 Internal Server Error` - Server error

---

## User Endpoints

### GET /users/:id/profile
Get user profile by ID (public endpoint).

**URL Parameters:**
- `id` - User ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "profile": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "city": "string",
    "role": "string",
    "skill_level": "string (player only)",
    "organizer_contact": "string (organizer only)",
    "matches_played": 0,
    "wins": 0,
    "win_rate": "0.0 (player only)",
    "tournament_history": [
      {
        "tournament_id": "uuid",
        "tournament_name": "string",
        "tournament_date": "date",
        "venue": "string",
        "status": "string",
        "joined_at": "timestamp"
      }
    ],
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### PATCH /users/:id/profile
Update user profile (authenticated, can only update own profile).

**URL Parameters:**
- `id` - User ID (UUID)

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Request Body:**
```json
{
  "name": "string (optional, 2-100 chars)",
  "city": "string (optional, 2-100 chars)",
  "skill_level": "beginner | intermediate | advanced (optional, player only)",
  "organizer_contact": "string (optional, 10 digits, organizer only)"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "city": "string",
    "role": "string",
    "skill_level": "string",
    "matches_played": 0,
    "wins": 0,
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or no fields to update
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not authorized to update this profile
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### GET /users/:id/stats
Get player statistics (public endpoint).

**URL Parameters:**
- `id` - User ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "stats": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "city": "string",
    "skill_level": "string",
    "matches_played": 0,
    "wins": 0,
    "win_rate": "0.00"
  }
}
```

**Error Responses:**
- `404 Not Found` - Player not found
- `500 Internal Server Error` - Server error

---

## Status Endpoints

### GET /
API information.

**Response: 200 OK**
```json
{
  "message": "Pathfinder Enhanced API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "testAuth": "/api/test-auth (protected)"
  }
}
```

---

### GET /health
Health check endpoint.

**Response: 200 OK**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "database": "connected",
  "firebase": "configured"
}
```

---

### GET /api/test-auth
Test authentication (protected endpoint).

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Authentication successful!",
  "user": {
    "user_id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "city": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found in database

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

---

## Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting implemented. Will be added in future updates.

---

## Postman Collection

Import this collection to test all endpoints:

**Base URL:** `http://localhost:5000`

**Environment Variables:**
- `firebase_token` - Your Firebase ID token
- `user_id` - User ID for testing

---

## Tournament Endpoints

### POST /tournaments
Create a new tournament (organizer only, authenticated).

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Request Body:**
```json
{
  "tournament_name": "string (required, min 3 chars)",
  "venue": "string (required)",
  "tournament_date": "date (required, YYYY-MM-DD, today or future)",
  "match_type": "singles | doubles (required)",
  "format": "knockout | league (required)",
  "entry_fee": "number (optional, default 0)",
  "prize_money": "number (optional, default 0)",
  "max_players": "8 | 16 | 32 (required)"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Tournament created successfully",
  "tournament": {
    "tournament_id": "uuid",
    "organizer_id": "uuid",
    "tournament_name": "string",
    "venue": "string",
    "tournament_date": "date",
    "match_type": "string",
    "format": "string",
    "entry_fee": 0,
    "prize_money": 0,
    "max_players": 16,
    "current_players": 0,
    "status": "upcoming",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or missing fields
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User is not an organizer
- `500 Internal Server Error` - Server error

---

### GET /tournaments
List all tournaments with optional filters (public endpoint).

**Query Parameters:**
- `status` - Filter by status (upcoming, live, completed) - default: upcoming
- `city` - Filter by city (searches in venue)
- `match_type` - Filter by match type (singles, doubles)
- `format` - Filter by format (knockout, league)
- `date_from` - Filter by start date (YYYY-MM-DD)
- `date_to` - Filter by end date (YYYY-MM-DD)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Response: 200 OK**
```json
{
  "success": true,
  "count": 10,
  "limit": 20,
  "offset": 0,
  "tournaments": [
    {
      "tournament_id": "uuid",
      "organizer_id": "uuid",
      "tournament_name": "string",
      "venue": "string",
      "tournament_date": "date",
      "match_type": "string",
      "format": "string",
      "entry_fee": 0,
      "prize_money": 0,
      "max_players": 16,
      "current_players": 5,
      "status": "upcoming",
      "organizer_name": "string",
      "current_players_count": "5",
      "created_at": "timestamp"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### GET /tournaments/:id
Get tournament details by ID (public endpoint).

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "tournament": {
    "tournament_id": "uuid",
    "organizer_id": "uuid",
    "tournament_name": "string",
    "venue": "string",
    "tournament_date": "date",
    "match_type": "string",
    "format": "string",
    "entry_fee": 0,
    "prize_money": 0,
    "max_players": 16,
    "current_players": 5,
    "status": "upcoming",
    "organizer_name": "string",
    "organizer_email": "string",
    "organizer_contact": "string",
    "current_players_count": "5",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `404 Not Found` - Tournament not found
- `500 Internal Server Error` - Server error

---

### GET /tournaments/organizer/:id
Get all tournaments by organizer (authenticated, can only view own tournaments).

**URL Parameters:**
- `id` - Organizer user ID (UUID)

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Query Parameters:**
- `status` - Filter by status (optional)

**Response: 200 OK**
```json
{
  "success": true,
  "count": 5,
  "tournaments": [
    {
      "tournament_id": "uuid",
      "tournament_name": "string",
      "venue": "string",
      "tournament_date": "date",
      "status": "upcoming",
      "current_players_count": "5",
      "total_matches": "0",
      "max_players": 16,
      "created_at": "timestamp"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Can only view own tournaments
- `500 Internal Server Error` - Server error

---

### PATCH /tournaments/:id
Update tournament (authenticated, organizer only, upcoming tournaments only).

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Request Body:**
```json
{
  "tournament_name": "string (optional)",
  "venue": "string (optional)",
  "tournament_date": "date (optional, YYYY-MM-DD)",
  "match_type": "singles | doubles (optional)",
  "format": "knockout | league (optional)",
  "entry_fee": "number (optional)",
  "prize_money": "number (optional)",
  "max_players": "8 | 16 | 32 (optional)"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Tournament updated successfully",
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "string",
    "venue": "string",
    "tournament_date": "date",
    "match_type": "string",
    "format": "string",
    "entry_fee": 0,
    "prize_money": 0,
    "max_players": 16,
    "current_players": 5,
    "status": "upcoming",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation failed or no fields to update
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Can only edit own upcoming tournaments
- `404 Not Found` - Tournament not found
- `500 Internal Server Error` - Server error

---

### DELETE /tournaments/:id
Delete tournament (authenticated, organizer only, upcoming tournaments only).

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Headers:**
```
Authorization: Bearer [your_firebase_token]
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Tournament deleted successfully",
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Can only delete own upcoming tournaments
- `404 Not Found` - Tournament not found
- `500 Internal Server Error` - Server error

---

## Coming Soon

- Match endpoints (Week 2)
- Participant endpoints (Week 2)
- Match generation (Week 2)
- Score entry (Week 2)

---

**Last Updated:** December 17, 2024  
**API Version:** 1.0.0


---

## Participant Endpoints

### POST /tournaments/:id/join
Join a tournament (Player only).

**Authentication:** Required (Player role)

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Successfully joined tournament",
  "participant": {
    "participant_id": "uuid",
    "tournament_id": "uuid",
    "user_id": "uuid",
    "joined_at": "timestamp",
    "status": "registered"
  },
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "string",
    "current_players": 5,
    "max_players": 16
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - User is not a player
- `404 Not Found` - Tournament not found
- `400 Bad Request` - Already joined, tournament full, or not upcoming

---

### DELETE /tournaments/:id/leave
Leave a tournament (Player only).

**Authentication:** Required (Player role)

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Successfully left tournament",
  "participant": {
    "participant_id": "uuid",
    "tournament_id": "uuid",
    "user_id": "uuid",
    "joined_at": "timestamp",
    "status": "registered"
  },
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "string",
    "current_players": 4,
    "max_players": 16
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Tournament not found
- `400 Bad Request` - Not a participant or tournament not upcoming

---

### GET /tournaments/:id/participants
Get all participants for a tournament (Public).

**Authentication:** Not required

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "count": 5,
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "Bangalore Open 2025",
    "max_players": 16,
    "status": "upcoming"
  },
  "participants": [
    {
      "participant_id": "uuid",
      "tournament_id": "uuid",
      "user_id": "uuid",
      "joined_at": "timestamp",
      "status": "registered",
      "full_name": "John Doe",
      "email": "john@example.com",
      "contact_number": "9876543210",
      "city": "Bangalore",
      "skill_level": "intermediate",
      "matches_played": 25,
      "matches_won": 15,
      "win_rate": 60.00
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Tournament not found

---

### GET /tournaments/:id/check-participation
Check if current user is a participant (Protected).

**Authentication:** Required

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "tournament_id": "uuid",
  "user_id": "uuid",
  "is_participant": true
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `404 Not Found` - Tournament not found

---

### GET /users/:id/tournaments
Get all tournaments a user has joined (Protected).

**Authentication:** Required (Can only view own tournaments)

**URL Parameters:**
- `id` - User ID (UUID)

**Query Parameters:**
- `status` (optional) - Filter by tournament status: `upcoming`, `live`, `completed`

**Response: 200 OK**
```json
{
  "success": true,
  "count": 3,
  "tournaments": [
    {
      "tournament_id": "uuid",
      "tournament_name": "Bangalore Open 2025",
      "venue": "Sportz Village, Whitefield",
      "tournament_date": "2025-01-15",
      "match_type": "singles",
      "format": "knockout",
      "entry_fee": 500,
      "prize_money": 5000,
      "max_players": 16,
      "current_players": 0,
      "tournament_status": "upcoming",
      "participant_id": "uuid",
      "joined_at": "timestamp",
      "participant_status": "registered",
      "organizer_name": "Coach Rajesh",
      "current_players_count": "5"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Trying to view another user's tournaments

---

## Participant Business Rules

### Join Tournament Rules
1. **Player Only**: Only users with role "player" can join tournaments
2. **Upcoming Only**: Can only join tournaments with status "upcoming"
3. **No Duplicates**: Cannot join the same tournament twice
4. **Space Available**: Tournament must not be full (current_players < max_players)

### Leave Tournament Rules
1. **Participant Only**: Can only leave if already a participant
2. **Upcoming Only**: Can only leave tournaments with status "upcoming"
3. **No Refunds**: Leaving does not trigger automatic refunds (handled separately)

### View Participants Rules
1. **Public Access**: Anyone can view tournament participants
2. **Includes Stats**: Shows player statistics and win rates
3. **Ordered by Join Time**: Participants listed in order they joined

### View User Tournaments Rules
1. **Own Tournaments Only**: Users can only view their own joined tournaments
2. **Status Filter**: Optional filter by tournament status
3. **Includes Details**: Shows full tournament and organizer information

---

## Complete Endpoint Summary

### Authentication (2 endpoints)
- POST /auth/signup - Create user account
- POST /auth/login - Login user

### User Management (3 endpoints)
- GET /users/:id/profile - Get user profile
- PATCH /users/:id/profile - Update user profile
- GET /users/:id/stats - Get player statistics

### Tournament Management (6 endpoints)
- POST /tournaments - Create tournament (Organizer)
- GET /tournaments - List tournaments with filters
- GET /tournaments/:id - Get tournament details
- GET /tournaments/organizer/:id - Get organizer's tournaments
- PATCH /tournaments/:id - Update tournament (Owner)
- DELETE /tournaments/:id - Delete tournament (Owner)

### Participant Management (5 endpoints)
- POST /tournaments/:id/join - Join tournament (Player)
- DELETE /tournaments/:id/leave - Leave tournament (Player)
- GET /tournaments/:id/participants - Get tournament participants
- GET /tournaments/:id/check-participation - Check if user is participant
- GET /users/:id/tournaments - Get user's joined tournaments

### Status/Health (3 endpoints)
- GET / - API information
- GET /health - Health check
- GET /api/test-auth - Test authentication

**Total: 19 API Endpoints**


---

## Match Endpoints

### POST /tournaments/:id/generate-matches
Generate matches for a tournament (Organizer only).

**Authentication:** Required (Organizer role, tournament owner)

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Business Rules:**
- Tournament must be in "upcoming" status
- Must have correct number of participants:
  - Knockout: Power of 2 (8, 16, 32)
  - League: 3-16 participants
- Matches cannot already exist
- Only tournament organizer can generate

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Matches generated successfully",
  "tournament": {
    "tournament_id": "uuid",
    "status": "live",
    "...": "other tournament fields"
  },
  "statistics": {
    "total_participants": 16,
    "total_matches": 15,
    "total_rounds": 4,
    "format": "knockout",
    "matches_created": 15
  },
  "matches": [
    {
      "match_id": "uuid",
      "tournament_id": "uuid",
      "round_number": 1,
      "match_number": 1,
      "player1_id": "uuid",
      "player2_id": "uuid",
      "player1_score": null,
      "player2_score": null,
      "winner_id": null,
      "status": "pending",
      "scheduled_time": null,
      "created_at": "timestamp"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not organizer or not tournament owner
- `404 Not Found` - Tournament not found
- `400 Bad Request` - Invalid participant count, matches already exist, or tournament not upcoming

---

### GET /tournaments/:id/matches
Get all matches for a tournament (Public).

**Authentication:** Not required

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Query Parameters:**
- `round` (optional) - Filter by round number (integer)

**Response: 200 OK**
```json
{
  "success": true,
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "Bangalore Open 2025",
    "format": "knockout",
    "status": "live"
  },
  "total_matches": 15,
  "rounds": [
    {
      "round_number": 1,
      "round_name": "Round 1",
      "matches": [
        {
          "match_id": "uuid",
          "tournament_id": "uuid",
          "round_number": 1,
          "match_number": 1,
          "player1_id": "uuid",
          "player1_name": "John Doe",
          "player1_skill": "intermediate",
          "player2_id": "uuid",
          "player2_name": "Jane Smith",
          "player2_skill": "advanced",
          "player1_score": null,
          "player2_score": null,
          "winner_id": null,
          "winner_name": null,
          "status": "pending",
          "scheduled_time": null,
          "created_at": "timestamp"
        }
      ]
    },
    {
      "round_number": 2,
      "round_name": "Quarter Finals",
      "matches": []
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Tournament not found

---

### GET /matches/:id
Get match details by ID (Public).

**Authentication:** Not required

**URL Parameters:**
- `id` - Match ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "match": {
    "match_id": "uuid",
    "tournament_id": "uuid",
    "tournament_name": "Bangalore Open 2025",
    "format": "knockout",
    "round_number": 1,
    "match_number": 1,
    "player1_id": "uuid",
    "player1_name": "John Doe",
    "player1_email": "john@example.com",
    "player1_skill": "intermediate",
    "player2_id": "uuid",
    "player2_name": "Jane Smith",
    "player2_email": "jane@example.com",
    "player2_skill": "advanced",
    "player1_score": null,
    "player2_score": null,
    "winner_id": null,
    "winner_name": null,
    "status": "pending",
    "scheduled_time": null,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Error Responses:**
- `404 Not Found` - Match not found

---

### DELETE /tournaments/:id/matches
Delete all matches for a tournament (Organizer only).

**Authentication:** Required (Organizer role, tournament owner)

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Business Rules:**
- Only tournament organizer can delete
- Cannot delete matches for completed tournaments
- Tournament status reverts to "upcoming"
- Useful for regenerating matches with different participants

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Matches deleted successfully",
  "deleted_count": 15
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not organizer or not tournament owner
- `404 Not Found` - Tournament not found
- `400 Bad Request` - Tournament is completed

---

## Match Generation Logic

### Knockout Format

**Requirements:**
- Participant count must be power of 2 (8, 16, 32)
- Minimum 4 participants

**Algorithm:**
1. Shuffle participants randomly
2. Generate first round with all participants
3. Create placeholder matches for subsequent rounds
4. Winners advance to next round (filled after match completion)

**Round Names:**
- 32 players: Round 1 → Round of 16 → Quarter Finals → Semi Finals → Finals
- 16 players: Round 1 → Quarter Finals → Semi Finals → Finals
- 8 players: Round 1 → Semi Finals → Finals

**Total Matches:** n - 1 (where n = number of participants)

**Example (8 players):**
- Round 1: 4 matches (8 players)
- Round 2 (Semi Finals): 2 matches (4 winners)
- Round 3 (Finals): 1 match (2 winners)
- Total: 7 matches

---

### League Format

**Requirements:**
- Minimum 3 participants
- Maximum 16 participants

**Algorithm:**
1. Shuffle participants randomly
2. Generate all possible pairings (round-robin)
3. Each player plays every other player once

**Total Matches:** n × (n - 1) / 2 (where n = number of participants)

**Example (4 players: A, B, C, D):**
- Match 1: A vs B
- Match 2: A vs C
- Match 3: A vs D
- Match 4: B vs C
- Match 5: B vs D
- Match 6: C vs D
- Total: 6 matches

---

## Match Business Rules

### Generation Rules
1. **Organizer Only**: Only tournament organizers can generate matches
2. **Owner Only**: Can only generate for own tournaments
3. **Upcoming Only**: Tournament must be in "upcoming" status
4. **Correct Count**: Must have valid number of participants for format
5. **No Duplicates**: Cannot generate if matches already exist
6. **Status Update**: Tournament status changes to "live" after generation

### Deletion Rules
1. **Organizer Only**: Only tournament organizers can delete matches
2. **Owner Only**: Can only delete for own tournaments
3. **Not Completed**: Cannot delete matches for completed tournaments
4. **Status Revert**: Tournament status reverts to "upcoming" after deletion
5. **Regeneration**: Allows regenerating matches with updated participants

### Viewing Rules
1. **Public Access**: Anyone can view tournament matches
2. **Round Filtering**: Optional filter by round number
3. **Grouped Display**: Matches grouped by round with names
4. **Player Details**: Includes player names and skill levels

---

## Complete Endpoint Summary

### Authentication (2 endpoints)
- POST /auth/signup - Create user account
- POST /auth/login - Login user

### User Management (3 endpoints)
- GET /users/:id/profile - Get user profile
- PATCH /users/:id/profile - Update user profile
- GET /users/:id/stats - Get player statistics

### Tournament Management (6 endpoints)
- POST /tournaments - Create tournament (Organizer)
- GET /tournaments - List tournaments with filters
- GET /tournaments/:id - Get tournament details
- GET /tournaments/organizer/:id - Get organizer's tournaments
- PATCH /tournaments/:id - Update tournament (Owner)
- DELETE /tournaments/:id - Delete tournament (Owner)

### Participant Management (5 endpoints)
- POST /tournaments/:id/join - Join tournament (Player)
- DELETE /tournaments/:id/leave - Leave tournament (Player)
- GET /tournaments/:id/participants - Get tournament participants
- GET /tournaments/:id/check-participation - Check if user is participant
- GET /users/:id/tournaments - Get user's joined tournaments

### Match Management (4 endpoints)
- POST /tournaments/:id/generate-matches - Generate matches (Organizer)
- GET /tournaments/:id/matches - Get tournament matches
- GET /matches/:id - Get match details
- DELETE /tournaments/:id/matches - Delete matches (Organizer)

### Status/Health (3 endpoints)
- GET / - API information
- GET /health - Health check
- GET /api/test-auth - Test authentication

**Total: 23 API Endpoints**


---

## Score Submission Endpoints

### POST /matches/:id/score
Submit score for a match (Organizer only).

**Authentication:** Required (Organizer role, tournament owner)

**URL Parameters:**
- `id` - Match ID (UUID)

**Request Body:**
```json
{
  "player1_score": 21,
  "player2_score": 15
}
```

**Validation Rules:**
- Both scores are required
- Scores must be non-negative integers
- No ties allowed (scores cannot be equal)
- Match must have both players assigned
- Match cannot already be completed
- Only tournament organizer can submit

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "match": {
    "match_id": "uuid",
    "tournament_id": "uuid",
    "round_number": 1,
    "match_number": 1,
    "player1_id": "uuid",
    "player2_id": "uuid",
    "player1_score": 21,
    "player2_score": 15,
    "winner_id": "uuid",
    "status": "completed",
    "updated_at": "timestamp"
  },
  "winner_id": "uuid",
  "tournament_complete": false
}
```

**Effects:**
1. Updates match with scores and winner
2. Updates winner's stats: `matches_played +1`, `matches_won +1`
3. Updates loser's stats: `matches_played +1`
4. **Knockout format:** Winner advances to next round
5. Checks if tournament is complete
6. If complete, updates tournament status to "completed"

**Error Responses:**
- `401 Unauthorized` - No authentication token
- `403 Forbidden` - Not organizer or not tournament owner
- `404 Not Found` - Match not found
- `400 Bad Request` - Invalid scores, tie, match already completed, or players not assigned

---

### GET /tournaments/:id/leaderboard
Get tournament leaderboard (League format only).

**Authentication:** Not required

**URL Parameters:**
- `id` - Tournament ID (UUID)

**Response: 200 OK**
```json
{
  "success": true,
  "tournament": {
    "tournament_id": "uuid",
    "tournament_name": "Bangalore League 2025",
    "format": "league",
    "status": "live"
  },
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "full_name": "John Doe",
      "skill_level": "advanced",
      "matches_played": 5,
      "wins": 4,
      "losses": 1,
      "points": 12,
      "total_score": 105
    },
    {
      "rank": 2,
      "user_id": "uuid",
      "full_name": "Jane Smith",
      "skill_level": "intermediate",
      "matches_played": 5,
      "wins": 3,
      "losses": 2,
      "points": 9,
      "total_score": 98
    }
  ]
}
```

**Sorting Logic:**
1. Points (3 points per win)
2. Number of wins
3. Total score

**Error Responses:**
- `404 Not Found` - Tournament not found
- `400 Bad Request` - Tournament is not league format

---

## Score Submission Business Rules

### Validation Rules
1. **Both Scores Required**: Must provide scores for both players
2. **Non-negative Integers**: Scores must be 0 or positive whole numbers
3. **No Ties**: Scores cannot be equal (must have a winner)
4. **Players Assigned**: Match must have both player1_id and player2_id
5. **Not Completed**: Cannot submit score for already completed match
6. **Organizer Only**: Only tournament organizer can submit scores

### Player Statistics Updates
**Winner:**
- `matches_played` incremented by 1
- `matches_won` incremented by 1
- Win rate automatically recalculated

**Loser:**
- `matches_played` incremented by 1
- Win rate automatically recalculated

### Knockout Advancement Logic
When a score is submitted for a knockout match:
1. Winner is determined (higher score)
2. Winner advances to next round
3. Next round match is determined by:
   - Match number in current round
   - Position in bracket (player1 or player2 slot)
4. Winner is assigned to appropriate slot in next round match

**Example:**
```
Round 1:
- Match 1: A vs B → Winner: A
- Match 2: C vs D → Winner: C
- Match 3: E vs F → Winner: E
- Match 4: G vs H → Winner: H

Round 2 (Semi Finals):
- Match 1: A vs C (from Round 1 matches 1 & 2)
- Match 2: E vs H (from Round 1 matches 3 & 4)
```

### Tournament Completion Detection

**Knockout Format:**
- Tournament is complete when all matches with assigned players are completed
- Final match completion triggers tournament status change

**League Format:**
- Tournament is complete when all matches are completed
- All players must have played all their matches

### Leaderboard Calculation (League Only)

**Points System:**
- Win: 3 points
- Loss: 0 points
- (No draws in badminton)

**Ranking Priority:**
1. Total points (wins × 3)
2. Number of wins
3. Total score across all matches

---

## Complete Endpoint Summary

### Authentication (2 endpoints)
- POST /auth/signup - Create user account
- POST /auth/login - Login user

### User Management (3 endpoints)
- GET /users/:id/profile - Get user profile
- PATCH /users/:id/profile - Update user profile
- GET /users/:id/stats - Get player statistics

### Tournament Management (6 endpoints)
- POST /tournaments - Create tournament (Organizer)
- GET /tournaments - List tournaments with filters
- GET /tournaments/:id - Get tournament details
- GET /tournaments/organizer/:id - Get organizer's tournaments
- PATCH /tournaments/:id - Update tournament (Owner)
- DELETE /tournaments/:id - Delete tournament (Owner)

### Participant Management (5 endpoints)
- POST /tournaments/:id/join - Join tournament (Player)
- DELETE /tournaments/:id/leave - Leave tournament (Player)
- GET /tournaments/:id/participants - Get tournament participants
- GET /tournaments/:id/check-participation - Check if user is participant
- GET /users/:id/tournaments - Get user's joined tournaments

### Match Management (4 endpoints)
- POST /tournaments/:id/generate-matches - Generate matches (Organizer)
- GET /tournaments/:id/matches - Get tournament matches
- GET /matches/:id - Get match details
- DELETE /tournaments/:id/matches - Delete matches (Organizer)

### Score Management (2 endpoints)
- POST /matches/:id/score - Submit match score (Organizer)
- GET /tournaments/:id/leaderboard - Get tournament leaderboard (League)

### Status/Health (3 endpoints)
- GET / - API information
- GET /health - Health check
- GET /api/test-auth - Test authentication

**Total: 25 API Endpoints**
