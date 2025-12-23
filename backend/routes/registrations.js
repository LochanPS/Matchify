// Registration and Payment API Routes
// Handles player registration, payment processing, and confirmation

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { createOrder, verifySignature, fetchPayment, refundPayment } = require('../config/razorpay');

/**
 * POST /registrations/initiate
 * Create registration and initiate payment
 */
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { tournament_id, category_id, player_name, player_email, player_phone } = req.body;

    // Validate required fields
    if (!tournament_id || !category_id || !player_name || !player_email || !player_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number (Indian format)
    if (!/^[6-9]\d{9}$/.test(player_phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Get category details
    const categoryResult = await db.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categoryResult.rows[0];

    // Check if category has available slots
    if (category.current_players >= category.max_players) {
      return res.status(400).json({ error: 'Category is full' });
    }

    // Check if already registered for this category
    const existingResult = await db.query(
      'SELECT * FROM registrations WHERE tournament_id = $1 AND player_id = $2 AND category_id = $3',
      [tournament_id, req.user.user_id, category_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this category' });
    }

    // Create Razorpay order
    const orderResult = await createOrder(
      category.entry_fee,
      `reg_${Date.now()}`,
      {
        tournament_id,
        category_id,
        player_id: req.user.user_id
      }
    );

    if (!orderResult.success) {
      return res.status(500).json({ error: 'Failed to create payment order' });
    }

    // Create pending registration
    const registrationResult = await db.query(
      `INSERT INTO registrations (
        tournament_id, player_id, category_id,
        player_name, player_email, player_phone,
        entry_fee, payment_status, payment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      RETURNING *`,
      [
        tournament_id,
        req.user.user_id,
        category_id,
        player_name,
        player_email,
        player_phone,
        category.entry_fee,
        orderResult.orderId
      ]
    );

    res.json({
      registration_id: registrationResult.rows[0].registration_id,
      razorpay_order_id: orderResult.orderId,
      amount: orderResult.amount,
      razorpay_key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Registration initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate registration' });
  }
});

/**
 * POST /registrations/verify
 * Verify payment and confirm registration
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { registration_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const isValidSignature = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch payment details from Razorpay
    const paymentResult = await fetchPayment(razorpay_payment_id);

    if (!paymentResult.success || paymentResult.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured' });
    }

    // Get registration details
    const registrationResult = await db.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [registration_id]
    );

    if (registrationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = registrationResult.rows[0];

    // Verify ownership
    if (registration.player_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update registration status
    const updatedResult = await db.query(
      `UPDATE registrations
       SET payment_status = 'paid',
           payment_method = $1,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE registration_id = $2
       RETURNING *`,
      [paymentResult.method, registration_id]
    );

    // Increment category's current_players
    await db.query(
      'UPDATE categories SET current_players = current_players + 1 WHERE category_id = $1',
      [registration.category_id]
    );

    // Update tournament stats
    await db.query(
      `UPDATE tournaments
       SET total_registrations = total_registrations + 1,
           total_revenue = total_revenue + $1,
           updated_at = NOW()
       WHERE tournament_id = $2`,
      [registration.entry_fee, registration.tournament_id]
    );

    // TODO: Send confirmation email
    // await sendConfirmationEmail(updatedResult.rows[0]);

    res.json({
      message: 'Registration confirmed!',
      registration: updatedResult.rows[0]
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

/**
 * GET /registrations/:id
 * Get registration details
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = result.rows[0];

    // Verify ownership
    if (registration.player_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

/**
 * GET /registrations/tournament/:tournament_id
 * Get all registrations for a tournament (organizer only)
 */
router.get('/tournament/:tournament_id', authenticateToken, async (req, res) => {
  try {
    const { tournament_id } = req.params;

    // Verify organizer ownership
    const tournamentResult = await db.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournamentResult.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get all registrations
    const result = await db.query(
      `SELECT r.*, c.category_name, u.name as organizer_name
       FROM registrations r
       JOIN categories c ON r.category_id = c.category_id
       JOIN users u ON r.player_id = u.user_id
       WHERE r.tournament_id = $1
       ORDER BY r.registered_at DESC`,
      [tournament_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tournament registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

/**
 * POST /registrations/:id/refund
 * Refund a registration (organizer cancels tournament)
 */
router.post('/:id/refund', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get registration
    const registrationResult = await db.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [id]
    );

    if (registrationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = registrationResult.rows[0];

    // Verify organizer ownership
    const tournamentResult = await db.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [registration.tournament_id]
    );

    if (tournamentResult.rows[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Only refund paid registrations
    if (registration.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Can only refund paid registrations' });
    }

    // Process refund
    const refundResult = await refundPayment(
      registration.payment_id,
      registration.entry_fee,
      reason || 'Tournament cancelled'
    );

    if (!refundResult.success) {
      return res.status(500).json({ error: 'Failed to process refund' });
    }

    // Update registration status
    const updatedResult = await db.query(
      `UPDATE registrations
       SET payment_status = 'refunded',
           updated_at = NOW()
       WHERE registration_id = $1
       RETURNING *`,
      [id]
    );

    // Decrement category's current_players
    await db.query(
      'UPDATE categories SET current_players = current_players - 1 WHERE category_id = $1',
      [registration.category_id]
    );

    // Update tournament stats
    await db.query(
      `UPDATE tournaments
       SET total_registrations = total_registrations - 1,
           total_revenue = total_revenue - $1,
           updated_at = NOW()
       WHERE tournament_id = $2`,
      [registration.entry_fee, registration.tournament_id]
    );

    res.json({
      message: 'Refund processed successfully',
      registration: updatedResult.rows[0],
      refund: refundResult
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

/**
 * POST /registrations/:id/withdraw
 * Player withdraws from tournament
 */
router.post('/:id/withdraw', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get registration
    const registrationResult = await db.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [id]
    );

    if (registrationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = registrationResult.rows[0];

    // Verify ownership
    if (registration.player_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if tournament hasn't started
    const tournamentResult = await db.query(
      'SELECT * FROM tournaments WHERE tournament_id = $1',
      [registration.tournament_id]
    );

    const tournament = tournamentResult.rows[0];
    const tournamentDate = new Date(tournament.tournament_date);
    const now = new Date();

    if (tournamentDate < now) {
      return res.status(400).json({ error: 'Cannot withdraw from past tournaments' });
    }

    // Delete registration
    await db.query(
      'DELETE FROM registrations WHERE registration_id = $1',
      [id]
    );

    // Decrement category's current_players
    await db.query(
      'UPDATE categories SET current_players = current_players - 1 WHERE category_id = $1',
      [registration.category_id]
    );

    // Update tournament stats
    if (registration.payment_status === 'paid') {
      await db.query(
        `UPDATE tournaments
         SET total_registrations = total_registrations - 1,
             total_revenue = total_revenue - $1,
             updated_at = NOW()
         WHERE tournament_id = $2`,
        [registration.entry_fee, registration.tournament_id]
      );
    }

    res.json({ message: 'Withdrawn successfully' });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to withdraw' });
  }
});

module.exports = router;
