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
