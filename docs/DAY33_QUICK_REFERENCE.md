# Day 33 Quick Reference - Payment Integration

## What Was Built

A complete payment integration system with Razorpay for tournament category registration.

## Key Components

### Frontend (3 new components)
1. **CategoryRegistrationForm** - Collects user data and partner info
2. **PaymentModal** - Handles Razorpay payment
3. **PaymentConfirmation** - Shows success and receipt

### Backend (1 new controller + 1 new route file)
1. **paymentController.js** - All payment logic
2. **payments.js** - Route definitions

## Payment Flow

```
User clicks Register
    ↓
Registration Form (name, email, phone, partner)
    ↓
Payment Modal (shows amount, opens Razorpay)
    ↓
Razorpay Payment (user completes payment)
    ↓
Signature Verification (backend verifies)
    ↓
Confirmation Screen (shows receipt)
    ↓
Player registered in category
```

## API Endpoints

### Frontend Calls
```javascript
// Initiate payment
POST /payments/initiate
Body: { category_id, player_id, amount }
Returns: { order_id, amount, currency }

// Verify payment
POST /payments/verify
Body: { razorpay_payment_id, razorpay_signature }
Returns: { success, payment_id, registration }

// Get payment status
GET /payments/status?category_id=X&player_id=Y
Returns: { payment }

// Get payment history
GET /payments/history/:playerId
Returns: { payments, total }
```

## Environment Variables

### Backend (.env)
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend (.env)
```
VITE_RAZORPAY_KEY_ID=your_key_id
```

## Installation Steps

1. Install Razorpay in backend:
   ```bash
   cd backend
   npm install razorpay
   ```

2. Get Razorpay API keys from dashboard

3. Add keys to .env files

4. Create database migrations:
   ```sql
   CREATE TABLE payments (
     payment_id SERIAL PRIMARY KEY,
     order_id VARCHAR(255) UNIQUE NOT NULL,
     razorpay_payment_id VARCHAR(255),
     player_id INTEGER NOT NULL,
     category_id INTEGER NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     status VARCHAR(50) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. Test payment flow

## Files Modified

- `frontend/src/pages/player/TournamentDetails.jsx` - Integrated payment flow
- `frontend/src/services/api.js` - Fixed payment endpoints
- `backend/server.js` - Added payment routes
- `backend/package.json` - Added razorpay dependency
- `backend/.env.example` - Added Razorpay vars
- `frontend/.env.example` - Added Razorpay key

## Files Created

- `frontend/src/components/tournaments/CategoryRegistrationForm.jsx`
- `frontend/src/components/tournaments/PaymentModal.jsx`
- `frontend/src/components/tournaments/PaymentConfirmation.jsx`
- `backend/controllers/paymentController.js`
- `backend/routes/payments.js`
- `docs/DAY33_COMPLETE.md`

## Testing Checklist

- [ ] Registration form validates correctly
- [ ] Partner selection works for doubles
- [ ] Payment modal opens
- [ ] Razorpay modal appears
- [ ] Payment completes successfully
- [ ] Signature verification passes
- [ ] Confirmation screen shows
- [ ] Receipt can be downloaded
- [ ] Player appears in category participants
- [ ] Payment history shows in user profile

## Security Features

- ✅ HMAC-SHA256 signature verification
- ✅ Webhook signature verification
- ✅ Authentication on all endpoints
- ✅ Input validation
- ✅ Error handling

## Next Steps

1. Set up Razorpay account
2. Get API keys
3. Configure environment variables
4. Run database migrations
5. Test end-to-end payment flow
6. Deploy to production

## Troubleshooting

### Razorpay script not loading
- Check if Razorpay CDN is accessible
- Verify VITE_RAZORPAY_KEY_ID is set

### Payment verification fails
- Check if RAZORPAY_KEY_SECRET is correct
- Verify signature calculation

### Order creation fails
- Check if RAZORPAY_KEY_ID is set
- Verify amount is in paise (multiply by 100)

### Webhook not working
- Check if RAZORPAY_WEBHOOK_SECRET is correct
- Verify webhook URL in Razorpay dashboard
- Check server logs for errors

## Support

For issues or questions, refer to:
- `docs/DAY33_COMPLETE.md` - Full documentation
- `docs/DAY33_PLAN.md` - Original plan
- Razorpay documentation: https://razorpay.com/docs/
