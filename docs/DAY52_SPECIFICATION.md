# Day 52: Tournament Poster Upload + Payment Integration

**Date:** December 20, 2025  
**Duration:** 8 hours  
**Focus:** Add tournament poster uploads and payment processing

---

## Overview

Day 52 adds two critical features to MATCHIFY:

1. **Tournament Poster Upload** - Organizers can upload tournament images/posters
2. **Payment Integration** - Players can pay entry fees using Razorpay/Stripe

These features enhance the tournament experience and enable monetization.

---

## Feature 1: Tournament Poster Upload

### Backend Changes

#### Database Migration (052_tournament_posters.sql)
```sql
-- Add poster_url to tournaments table
ALTER TABLE tournaments ADD COLUMN poster_url VARCHAR(500) NULL;

-- Create tournament_media table for future expansion
CREATE TABLE tournament_media (
  media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  media_type ENUM('poster', 'gallery', 'rules') NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(user_id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, media_type)
);

CREATE INDEX idx_tournament_media_tournament_id ON tournament_media(tournament_id);
```

#### API Endpoint: Upload Poster
```
POST /tournaments/:id/upload-poster
Content-Type: multipart/form-data

Request:
- file: File (image, max 5MB)
- tournament_id: UUID

Response:
{
  "success": true,
  "poster_url": "https://cdn.matchify.app/posters/tournament-123.jpg",
  "message": "Poster uploaded successfully"
}
```

#### Implementation (backend/routes/tournaments.js)
- Add multer middleware for file uploads
- Validate file type (jpg, png, webp only)
- Validate file size (max 5MB)
- Upload to cloud storage (AWS S3 or Cloudinary)
- Store URL in database
- Return poster URL

### Frontend Changes

#### Component: PosterUpload.jsx
```jsx
// Location: frontend/src/components/tournament/PosterUpload.jsx
- File input with preview
- Drag-and-drop support
- Progress indicator
- Error handling
- Success message
```

#### Update: CreateTournament.jsx
```jsx
// Add poster upload section
- Show upload component
- Display preview
- Show uploaded poster
- Allow re-upload
```

#### Update: TournamentDetails.jsx
```jsx
// Display poster
- Show poster image
- Fallback to default image
- Responsive sizing
- Lazy loading
```

---

## Feature 2: Payment Integration

### Backend Changes

#### Database Migration (052_payments.sql)
```sql
-- Create payments table
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(tournament_id),
  player_id UUID NOT NULL REFERENCES users(user_id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL,
  UNIQUE(tournament_id, player_id)
);

CREATE INDEX idx_payments_tournament_id ON payments(tournament_id);
CREATE INDEX idx_payments_player_id ON payments(player_id);
CREATE INDEX idx_payments_status ON payments(status);
```

#### API Endpoints

##### 1. Create Payment Order
```
POST /payments/create-order
Content-Type: application/json

Request:
{
  "tournament_id": "uuid",
  "amount": 500
}

Response:
{
  "success": true,
  "order_id": "order_123456",
  "amount": 500,
  "currency": "INR",
  "key": "razorpay_key_id"
}
```

##### 2. Verify Payment
```
POST /payments/verify
Content-Type: application/json

Request:
{
  "order_id": "order_123456",
  "payment_id": "pay_123456",
  "signature": "signature_hash",
  "tournament_id": "uuid"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "uuid"
}
```

##### 3. Get Payment Status
```
GET /payments/:tournament_id/status
Authorization: Bearer token

Response:
{
  "tournament_id": "uuid",
  "status": "completed",
  "amount": 500,
  "payment_method": "razorpay",
  "completed_at": "2025-12-20T10:30:00Z"
}
```

#### Implementation (backend/routes/payments.js)
- Razorpay integration
- Order creation
- Payment verification
- Signature validation
- Update participant status
- Error handling

### Frontend Changes

#### Component: PaymentModal.jsx
```jsx
// Location: frontend/src/components/tournament/PaymentModal.jsx
- Show tournament details
- Show entry fee
- Razorpay payment button
- Loading state
- Success/error messages
```

#### Update: TournamentDetails.jsx
```jsx
// Add payment flow
- Show entry fee
- "Pay & Join" button
- Open payment modal
- Handle payment response
- Update UI after payment
```

#### Update: JoinTournament.jsx
```jsx
// Integrate payment
- Check if entry fee exists
- Show payment modal if needed
- Handle payment completion
- Auto-join after payment
```

---

## Implementation Plan

### Phase 1: Database Setup (1 hour)
- [ ] Create migration files
- [ ] Add poster_url to tournaments
- [ ] Create tournament_media table
- [ ] Create payments table
- [ ] Run migrations

### Phase 2: Backend - Poster Upload (2 hours)
- [ ] Setup multer middleware
- [ ] Create upload endpoint
- [ ] Implement file validation
- [ ] Setup cloud storage (S3/Cloudinary)
- [ ] Update tournament model
- [ ] Test upload endpoint

### Phase 3: Backend - Payment Integration (2 hours)
- [ ] Setup Razorpay SDK
- [ ] Create payment routes
- [ ] Implement order creation
- [ ] Implement payment verification
- [ ] Update participant on payment
- [ ] Test payment flow

### Phase 4: Frontend - Poster Upload (1 hour)
- [ ] Create PosterUpload component
- [ ] Update CreateTournament
- [ ] Update TournamentDetails
- [ ] Test upload flow

### Phase 5: Frontend - Payment Integration (1 hour)
- [ ] Create PaymentModal component
- [ ] Update TournamentDetails
- [ ] Update JoinTournament
- [ ] Test payment flow

### Phase 6: Testing & Polish (1 hour)
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Edge cases
- [ ] Documentation

---

## Configuration

### Environment Variables
```
# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# AWS S3 (for poster uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=matchify-posters
AWS_S3_REGION=us-east-1

# Or Cloudinary (alternative)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Testing Checklist

### Poster Upload
- [ ] Upload valid image (jpg, png, webp)
- [ ] Reject invalid file type
- [ ] Reject file > 5MB
- [ ] Show preview before upload
- [ ] Display uploaded poster
- [ ] Allow re-upload
- [ ] Handle upload errors

### Payment Integration
- [ ] Create payment order
- [ ] Open Razorpay modal
- [ ] Complete payment successfully
- [ ] Verify payment signature
- [ ] Update participant status
- [ ] Handle payment failure
- [ ] Handle payment cancellation
- [ ] Prevent duplicate payments

---

## Success Criteria

✅ Tournament posters can be uploaded and displayed  
✅ Payment orders can be created  
✅ Payments can be verified securely  
✅ Participants are auto-joined after payment  
✅ All error cases handled  
✅ Mobile responsive  
✅ 0 errors in console  

---

## Files to Create/Modify

### New Files
- `backend/migrations/052_tournament_posters.sql`
- `backend/migrations/052_payments.sql`
- `backend/routes/payments.js`
- `backend/middleware/uploadMiddleware.js`
- `frontend/src/components/tournament/PosterUpload.jsx`
- `frontend/src/components/tournament/PaymentModal.jsx`

### Modified Files
- `backend/server.js` (add payment routes)
- `backend/models/Tournament.js` (add poster_url)
- `backend/routes/tournaments.js` (add upload endpoint)
- `frontend/src/pages/player/TournamentDetails.jsx`
- `frontend/src/pages/organizer/CreateTournament.jsx`
- `frontend/src/services/api.js` (add payment methods)
- `.env.example` (add payment config)

---

## Deliverables

✅ Tournament poster upload system  
✅ Payment integration with Razorpay  
✅ Secure payment verification  
✅ Updated database schema  
✅ Complete API endpoints  
✅ Frontend components  
✅ Error handling  
✅ Testing & documentation  

---

## Next Steps (Day 53+)

- Day 53: Notification System (email, SMS, push)
- Day 54: Tournament Templates & Quick Create
- Day 55: Advanced Analytics Dashboard
- Day 56: Referral System Enhancement
- Day 57: Mobile App Foundation (React Native)

---

**Status:** Ready for implementation  
**Estimated Duration:** 8 hours  
**Complexity:** Medium  
**Priority:** High (enables monetization)

