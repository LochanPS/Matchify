const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { verifyToken } = require('../middleware/auth');
const { query } = require('../db');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { tournament_id, amount } = req.body;
    const player_id = req.user.uid;

    // Validate input
    if (!tournament_id || !amount) {
      return res.status(400).json({ error: 'Tournament ID and amount required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Check if tournament exists
    const tournamentResult = await query(
      'SELECT tournament_id, entry_fee FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if already paid
    const paymentResult = await query(
      'SELECT payment_id FROM payments WHERE tournament_id = $1 AND player_id = $2 AND status = $3',
      [tournament_id, player_id, 'completed']
    );

    if (paymentResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already paid for this tournament' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `${tournament_id}-${player_id}`,
      notes: {
        tournament_id,
        player_id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store payment record
    await query(
      `INSERT INTO payments (tournament_id, player_id, amount, currency, status, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tournament_id, player_id, amount, 'INR', 'pending', order.id]
    );

    res.json({
      success: true,
      order_id: order.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { order_id, payment_id, signature, tournament_id } = req.body;
    const player_id = req.user.uid;

    // Validate input
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment record
    const updateResult = await query(
      `UPDATE payments 
       SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, completed_at = NOW()
       WHERE razorpay_order_id = $4 AND player_id = $5
       RETURNING payment_id, tournament_id`,
      ['completed', payment_id, signature, order_id, player_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const { tournament_id: tid } = updateResult.rows[0];

    // Auto-join tournament after payment
    const participantResult = await query(
      'SELECT participant_id FROM participants WHERE tournament_id = $1 AND player_id = $2',
      [tid, player_id]
    );

    if (participantResult.rows.length === 0) {
      await query(
        `INSERT INTO participants (tournament_id, player_id, joined_at)
         VALUES ($1, $2, NOW())`,
        [tid, player_id]
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: updateResult.rows[0].payment_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment status
router.get('/:tournament_id/status', verifyToken, async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const player_id = req.user.uid;

    const result = await query(
      `SELECT payment_id, tournament_id, status, amount, payment_method, completed_at
       FROM payments
       WHERE tournament_id = $1 AND player_id = $2`,
      [tournament_id, player_id]
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'not_paid' });
    }

    const payment = result.rows[0];
    res.json({
      tournament_id: payment.tournament_id,
      status: payment.status,
      amount: payment.amount,
      payment_method: payment.payment_method,
      completed_at: payment.completed_at,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Get tournament payments (organizer only)
router.get('/tournament/:tournament_id/payments', verifyToken, async (req, res) => {
  try {
    const { tournament_id } = req.params;
    const organizer_id = req.user.uid;

    // Verify organizer owns tournament
    const tournamentResult = await query(
      'SELECT organizer_id FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get payments
    const result = await query(
      `SELECT p.payment_id, p.amount, p.status, p.completed_at, u.name, u.email
       FROM payments p
       JOIN users u ON p.player_id = u.user_id
       WHERE p.tournament_id = $1
       ORDER BY p.created_at DESC`,
      [tournament_id]
    );

    res.json({
      tournament_id,
      total_payments: result.rows.length,
      total_amount: result.rows.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      payments: result.rows,
    });
  } catch (error) {
    console.error('Error getting tournament payments:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

module.exports = router;
