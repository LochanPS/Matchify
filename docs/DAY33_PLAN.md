# Day 33: Payment Integration & Category Registration

**Date:** December 31, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Payment gateway integration, category registration flow, payment verification

---

## Overview

Day 33 implements comprehensive payment integration with Razorpay/PhonePe and the complete category registration flow. Players can now register for specific tournament categories with payment-gated access, while organizers receive real-time payment confirmations.

---

## Part 1: Payment Gateway Setup (1.5 hours)

### 1.1 Razorpay Integration

```javascript
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
const order = await razorpay.orders.create({
  amount: entryFee * 100, // Amount in paise
  currency: 'INR',
  receipt: `tournament_${tournamentId}_${categoryId}`,
  notes: {
    tournament_id: tournamentId,
    category_id: categoryId,
    player_id: playerId
  }
});
```

**Features:**
- ✅ Order creation
- ✅ Amount handling (paise conversion)
- ✅ Receipt tracking
- ✅ Metadata storage

### 1.2 Payment Verification

```javascript
// Verify payment signature
const crypto = require('crypto');

function verifyPaymentSignature(orderId, paymentId, signature) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}
```

**Features:**
- ✅ Signature verification
- ✅ Security validation
- ✅ Tamper detection

---

## Part 2: Category Registration Form (2 hours)

### 2.1 Registration Form Component

Create comprehensive registration form:

```javascript
// frontend/src/components/tournaments/CategoryRegistrationForm.jsx
const CategoryRegistrationForm = ({ tournament, category, onSuccess }) => {
  // Form fields: name, email, phone, partner (if doubles)
  // Validation
  // Loading states
  // Error handling
};
```

**Features:**
- ✅ Pre-filled user data
- ✅ Partner selection for doubles
- ✅ Form validation
- ✅ Error messages
- ✅ Loading states

### 2.2 Payment Modal

Create payment confirmation modal:

```javascript
// frontend/src/components/tournaments/PaymentModal.jsx
const PaymentModal = ({ amount, tournament, category, onConfirm }) => {
  // Show payment details
  // Razorpay integration
  // Payment status
};
```

**Features:**
- ✅ Amount display
- ✅ Tournament details
- ✅ Category details
- ✅ Payment button

---

## Part 3: Payment Flow (2 hours)

### 3.1 Frontend Payment Flow

```javascript
// 1. User fills registration form
// 2. Form submitted
// 3. Create order on backend
// 4. Open Razorpay modal
// 5. User completes payment
// 6. Verify signature
// 7. Update registration status
// 8. Show confirmation
```

**Features:**
- ✅ Order creation
- ✅ Modal opening
- ✅ Payment handling
- ✅ Verification
- ✅ Confirmation

### 3.2 Backend Payment Processing

```javascript
// POST /categories/:categoryId/register
// 1. Validate registration data
// 2. Create order with Razorpay
// 3. Return order details to frontend
// 4. Frontend handles payment
// 5. POST /payments/verify
// 6. Verify signature
// 7. Update participant record
// 8. Send confirmation email
```

**Features:**
- ✅ Data validation
- ✅ Order creation
- ✅ Signature verification
- ✅ Database updates
- ✅ Email notifications

---

## Part 4: Payment Verification & Webhooks (1.5 hours)

### 4.1 Webhook Handler

```javascript
// POST /webhooks/razorpay
// Handle payment events:
// - payment.authorized
// - payment.failed
// - payment.captured
```

**Features:**
- ✅ Event handling
- ✅ Signature verification
- ✅ Database updates
- ✅ Error handling

### 4.2 Payment Status Tracking

```javascript
// Track payment status:
// - pending: Order created, awaiting payment
// - paid: Payment successful
// - failed: Payment failed
// - refunded: Refund processed
```

**Features:**
- ✅ Status tracking
- ✅ Transaction logging
- ✅ Retry handling

---

## Part 5: Confirmation & Notifications (1 hour)

### 5.1 Confirmation Screen

Show registration confirmation with:
- ✅ Tournament details
- ✅ Category details
- ✅ Payment receipt
- ✅ Transaction ID
- ✅ Next steps

### 5.2 Email Notifications

Send emails for:
- ✅ Registration confirmation
- ✅ Payment receipt
- ✅ Payment failure
- ✅ Refund confirmation

---

## Implementation Checklist

### Phase 1: Payment Setup (1.5 hours)
- [ ] Set up Razorpay account
- [ ] Get API keys
- [ ] Implement order creation
- [ ] Implement signature verification
- [ ] Test payment flow

### Phase 2: Registration Form (2 hours)
- [ ] Create registration form component
- [ ] Add form validation
- [ ] Add partner selection
- [ ] Add loading states
- [ ] Test form submission

### Phase 3: Payment Flow (2 hours)
- [ ] Implement frontend payment flow
- [ ] Implement backend payment processing
- [ ] Handle payment responses
- [ ] Update registration status
- [ ] Test end-to-end

### Phase 4: Webhooks (1.5 hours)
- [ ] Implement webhook handler
- [ ] Handle payment events
- [ ] Update database
- [ ] Test webhook delivery
- [ ] Error handling

### Phase 5: Notifications (1 hour)
- [ ] Create confirmation screen
- [ ] Send confirmation emails
- [ ] Send payment receipts
- [ ] Test notifications

---

## Expected Results

### Payment Integration
- ✅ Razorpay integration working
- ✅ Orders created successfully
- ✅ Payments processed
- ✅ Signatures verified

### Registration Flow
- ✅ Form validation working
- ✅ Payment flow working
- ✅ Confirmation screen showing
- ✅ Emails sent

### Data Tracking
- ✅ Payment status tracked
- ✅ Transaction IDs stored
- ✅ Receipts generated
- ✅ Refunds processed

---

## Success Criteria

- ✅ Payment gateway integrated
- ✅ Registration form working
- ✅ Payment flow complete
- ✅ Webhooks handling events
- ✅ Confirmations sent
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Payment setup: 1.5 hours
- Registration form: 2 hours
- Payment flow: 2 hours
- Webhooks: 1.5 hours
- Notifications: 1 hour
- Buffer: 0.5 hours

**Total: 8 hours**

---

## Next Steps (Day 34+)

- Doubles partner selection
- Team management
- Advanced tournament features
- Performance optimization

---

**Status:** 🚀 Ready to execute  
**Date:** December 31, 2024  
**Duration:** 8 hours  
**Next:** Day 34+ - Doubles Partner Selection
