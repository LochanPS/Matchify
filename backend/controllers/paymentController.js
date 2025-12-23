const crypto = require('crypto');
const Razorpay = require('razorpay');
const { query } = require('../config/database');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initiate payment - Create Razorpay order
exports.initiatePayment = async (req, res) => {
  try {
    const { category_id, player_id, amount } = req.body;

    if (!category_id || !player_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: category_id, player_id, amount',
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `tournament_${category_id}_${player_id}_${Date.now()}`,
      notes: {
        category_id,
        player_id,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Store order in database
    const insertQuery = `
      INSERT INTO payments (
        order_id, 
        player_id, 
        category_id, 
        amount, 
        status, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await query(insertQuery, [
      order.id,
      player_id,
      category_id,
      amount,
      'pending',
    ]);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      payment_record: result.rows[0],
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message,
    });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details',
      });
    }

    // Get order_id from database using payment_id
    const getOrderQuery = `
      SELECT order_id, player_id, category_id, amount 
      FROM payments 
      WHERE razorpay_payment_id = $1
      LIMIT 1
    `;

    const orderResult = await query(getOrderQuery, [razorpay_payment_id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    const { order_id } = orderResult.rows[0];

    // Verify signature
    const body = order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await query(
        'UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2',
        ['failed', razorpay_payment_id]
      );

      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

    // Update payment status to paid
    const updateQuery = `
      UPDATE payments 
      SET status = $1, razorpay_payment_id = $2, updated_at = NOW()
      WHERE order_id = $3
      RETURNING *
    `;

    const updateResult = await query(updateQuery, [
      'paid',
      razorpay_payment_id,
      order_id,
    ]);

    const payment = updateResult.rows[0];

    // Register player in category
    const registerQuery = `
      INSERT INTO category_participants (
        category_id,
        player_id,
        payment_status,
        registered_at
      ) VALUES ($1, $2, $3, NOW())
      ON CONFLICT (category_id, player_id) 
      DO UPDATE SET payment_status = $3, updated_at = NOW()
      RETURNING *
    `;

    const registrationResult = await query(registerQuery, [
      payment.category_id,
      payment.player_id,
      'paid',
    ]);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: order_id,
      registration: registrationResult.rows[0],
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { category_id, player_id } = req.query;

    if (!category_id || !player_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters: category_id, player_id',
      });
    }

    const selectQuery = `
      SELECT * FROM payments 
      WHERE category_id = $1 AND player_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await query(selectQuery, [category_id, player_id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        status: 'not_found',
        message: 'No payment record found',
      });
    }

    res.json({
      success: true,
      payment: result.rows[0],
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message,
    });
  }
};

// Get payment history for a player
exports.getPaymentHistory = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required',
      });
    }

    const selectQuery = `
      SELECT p.*, c.category_name, t.name as tournament_name
      FROM payments p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN tournaments t ON c.tournament_id = t.tournament_id
      WHERE p.player_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await query(selectQuery, [playerId]);

    res.json({
      success: true,
      payments: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message,
    });
  }
};

// Webhook handler for Razorpay events
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = req.body.event;
    const data = req.body.data;

    switch (event) {
      case 'payment.authorized':
        // Handle payment authorized
        await handlePaymentAuthorized(data);
        break;

      case 'payment.failed':
        // Handle payment failed
        await handlePaymentFailed(data);
        break;

      case 'payment.captured':
        // Handle payment captured
        await handlePaymentCaptured(data);
        break;

      case 'refund.created':
        // Handle refund created
        await handleRefundCreated(data);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
};

// Helper functions for webhook events
async function handlePaymentAuthorized(data) {
  const { id: payment_id, order_id } = data.payment;

  const updateQuery = `
    UPDATE payments 
    SET status = $1, razorpay_payment_id = $2, updated_at = NOW()
    WHERE order_id = $3
  `;

  await query(updateQuery, ['authorized', payment_id, order_id]);
  console.log('Payment authorized:', payment_id);
}

async function handlePaymentFailed(data) {
  const { id: payment_id, order_id } = data.payment;

  const updateQuery = `
    UPDATE payments 
    SET status = $1, razorpay_payment_id = $2, updated_at = NOW()
    WHERE order_id = $3
  `;

  await query(updateQuery, ['failed', payment_id, order_id]);
  console.log('Payment failed:', payment_id);
}

async function handlePaymentCaptured(data) {
  const { id: payment_id, order_id } = data.payment;

  const updateQuery = `
    UPDATE payments 
    SET status = $1, razorpay_payment_id = $2, updated_at = NOW()
    WHERE order_id = $3
  `;

  await query(updateQuery, ['captured', payment_id, order_id]);
  console.log('Payment captured:', payment_id);
}

async function handleRefundCreated(data) {
  const { id: refund_id, payment_id } = data.refund;

  const updateQuery = `
    UPDATE payments 
    SET status = $1, updated_at = NOW()
    WHERE razorpay_payment_id = $2
  `;

  await query(updateQuery, ['refunded', payment_id]);
  console.log('Refund created:', refund_id);
}
