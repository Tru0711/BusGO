const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn('RAZORPAY keys are not set in environment variables. Razorpay service will not be available.');
}

let razorpayClient = null;

const getRazorpayClient = () => {
  if (razorpayClient) {
    return razorpayClient;
  }

  if (!key_id || !key_secret) {
    return null;
  }

  razorpayClient = new Razorpay({
    key_id,
    key_secret,
  });

  return razorpayClient;
};

async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    const error = new Error('Razorpay credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    notes,
    payment_capture: 1,
  };

  const order = await razorpay.orders.create(options);
  return order;
}

function validateSignature({ orderId, paymentId, signature }) {
  const crypto = require('crypto');
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generated === signature;
}

module.exports = {
  createOrder,
  validateSignature,
  getRazorpayClient,
};
