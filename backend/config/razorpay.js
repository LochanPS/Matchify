// Razorpay configuration for payment processing
// Supports UPI, cards, net banking, and wallets

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} receipt - Receipt ID for tracking
 * @param {object} notes - Additional notes/metadata
 * @returns {Promise} Order details
 */
const createOrder = async (amount, receipt, notes = {}) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),  // Convert to paise
      currency: 'INR',
      receipt,
      notes,
      timeout: 900  // 15 minutes
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100,  // Convert back to INR
      currency: order.currency,
      status: order.status
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      description: payment.description,
      notes: payment.notes,
      createdAt: new Date(payment.created_at * 1000)
    };
  } catch (error) {
    console.error('Razorpay fetch payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from client
 * @returns {boolean} Signature validity
 */
const verifySignature = (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Verify webhook signature
 * @param {object} body - Request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} Webhook validity
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
};

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @param {string} reason - Refund reason
 * @returns {Promise} Refund details
 */
const refundPayment = async (paymentId, amount = null, reason = 'Tournament cancelled') => {
  try {
    const refundData = {
      notes: {
        reason
      }
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);  // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      status: refund.status,
      reason: refund.notes?.reason
    };
  } catch (error) {
    console.error('Razorpay refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  razorpay,
  createOrder,
  fetchPayment,
  verifySignature,
  verifyWebhookSignature,
  refundPayment
};
