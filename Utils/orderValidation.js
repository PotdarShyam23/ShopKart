const crypto = require("node:crypto");

function orderError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
// Creates an error with a message and HTTP status code.

function validateShippingAddress(address) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    throw orderError("A shipping address is required.");
  }
  const labels = {
    fullName: "Full name",
    phone: "Phone",
    addressLine1: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };
  const cleaned = {};
  for (const [field, label] of Object.entries(labels)) {
    if (typeof address[field] !== "string" || !address[field].trim()) {
      throw orderError(label + " is required.");
    }
    cleaned[field] = address[field].trim();
    let maximumLength = 200;
    if (field === "addressLine1") {
      maximumLength = 500;
    }
    if (cleaned[field].length > maximumLength) {
      throw orderError(label + " is too long.");
    }
  }
  if (!/^[6-9][0-9]{9}$/.test(cleaned.phone)) {
    throw orderError("Enter a valid 10-digit Indian mobile number.");
  }
  if (!/^[0-9]{6}$/.test(cleaned.pincode)) {
    throw orderError("Pincode must contain exactly 6 digits.");
  }
  return cleaned;
}
// Validates and trims the submitted shipping address.

function buildOrderSnapshot(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw orderError("Your cart is empty.");
  }
  const items = cart.map(({ product, quantity }) => {
    if (!product) {
      throw orderError(
        "A product in your cart was deleted. Remove it before checkout.",
        409,
      );
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw orderError("Invalid quantity for " + product.name + ".");
    }
    if (!Number.isFinite(product.stock) || quantity > product.stock) {
      throw orderError(
        "Not enough stock for " + product.name + ". Please update your cart.",
        409,
      );
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw orderError("Invalid product price. Please try again later.", 409);
    }
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    };
  });
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const amount = Math.round(total * 100);
  if (!Number.isSafeInteger(amount) || amount < 100) {
    throw orderError(
      "Order amount must be at least ₹1 and within the supported range.",
    );
  }
  return {
    items,
    amount,
    totalAmount: amount / 100,
  };
}
// Checks cart quantities and stock, then calculates order snapshots and totals.

function hasValidSignature(orderId, paymentId, signature, secret) {
  if (typeof signature !== "string" || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false;
  }
  // The stored order ID is trusted; the browser cannot choose the signed order.

  const expected = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest();
  const supplied = Buffer.from(signature, "hex");
  return (
    supplied.length === expected.length &&
    crypto.timingSafeEqual(expected, supplied)
  );
}
// Checks the payment signature using the trusted order ID and backend secret.

module.exports = {
  orderError,
  validateShippingAddress,
  buildOrderSnapshot,
  hasValidSignature,
};
