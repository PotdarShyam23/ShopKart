const Razorpay = require("razorpay");

function getTestCredentials() {
  const key = process.env.RAZORPAY_KEY_ID?.trim();
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!key || !secret || !key.startsWith("rzp_test_")) {
    const error = new Error(
      "Configure Razorpay Test Mode keys on the backend before paying.",
    );
    error.statusCode = 503;
    throw error;
  }
  return {
    key,
    secret,
  };
}
// Returns configured Test Mode credentials and rejects missing or live keys.

function getRazorpay() {
  const { key, secret } = getTestCredentials();
  return {
    key,
    client: new Razorpay({
      key_id: key,
      key_secret: secret,
    }),
  };
}
// Creates a Razorpay client using the backend Test Mode credentials.

module.exports = {
  getRazorpay,
  getTestCredentials,
};
