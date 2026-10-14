const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { validateShippingAddress, buildOrderSnapshot, hasValidSignature } = require("../Utils/orderValidation.js");
const Customer = require("../Models/customer.model.js");
const Order = require("../Models/order.model.js");
const config = require("../Config/razorpay.js");
const realConfig = { ...config };
const secret = "unit-test-only-not-a-real-key";
let gatewayCalls = [];
let gatewayFails = false;
config.getTestCredentials = () => ({ key: "rzp_test_unit", secret });
config.getRazorpay = () => ({ key: "rzp_test_unit", client: { orders: { create: async (input) => {
  gatewayCalls.push(input);
  if (gatewayFails) throw new Error("Mock gateway failure");
  return { id: "order_unit", amount: input.amount, currency: "INR" };
} } } });
const controllers = require("../Controllers/order.controllers.js");
const address = { fullName: " Student ", phone: "9876543210", addressLine1: " 12 Test Road ", city: "Pune", state: "Maharashtra", pincode: "411001" };
const userId = new mongoose.Types.ObjectId().toString();
const orderId = new mongoose.Types.ObjectId().toString();
const productId = new mongoose.Types.ObjectId();
const product = { _id: productId, name: "Keyboard", price: 2999, stock: 10, image: "/products/keyboard-cream.svg" };
const signature = (order = "order_unit", payment = "pay_unit") => crypto.createHmac("sha256", secret).update(order + "|" + payment).digest("hex");
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });
const paymentBody = () => ({ shopKartOrderId: orderId, razorpay_order_id: "order_unit", razorpay_payment_id: "pay_unit", razorpay_signature: signature() });
const query = (value) => ({ then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); }, session: async () => value });

// These tests use in-memory stubs; they never connect to MongoDB or Razorpay.
test("shipping validation trims fields and rejects blank/invalid input", () => {
  assert.equal(validateShippingAddress(address).fullName, "Student");
  assert.equal(validateShippingAddress(address).addressLine1, "12 Test Road");
  for (const field of Object.keys(address)) assert.throws(() => validateShippingAddress({ ...address, [field]: " " }));
  assert.throws(() => validateShippingAddress({ ...address, phone: "1234567890" }));
  assert.throws(() => validateShippingAddress({ ...address, pincode: "41100" }));
  assert.throws(() => validateShippingAddress({ ...address, phone: 9876543210 }));
});

test("snapshots use product prices, reject deleted/oversold items, and preserve original data", () => {
  const snapshot = buildOrderSnapshot([{ product, quantity: 2 }]);
  assert.equal(snapshot.totalAmount, 5998);
  assert.equal(snapshot.amount, 599800);
  const changed = { ...product, price: 1, name: "Changed" };
  assert.notEqual(snapshot.items[0].name, changed.name);
  assert.equal(snapshot.items[0].price, 2999);
  assert.throws(() => buildOrderSnapshot([]));
  assert.throws(() => buildOrderSnapshot([{ product: null, quantity: 1 }]));
  assert.throws(() => buildOrderSnapshot([{ product, quantity: 11 }]));
  for (const quantity of [undefined, 0, -1, 1.5, "2"]) assert.throws(() => buildOrderSnapshot([{ product, quantity }]));
});

test("HMAC requires the trusted order/payment pair and rejects malformed signatures", () => {
  assert.equal(hasValidSignature("order_unit", "pay_unit", signature(), secret), true);
  assert.equal(hasValidSignature("order_other", "pay_unit", signature(), secret), false);
  assert.equal(hasValidSignature("order_unit", "pay_other", signature(), secret), false);
  assert.equal(hasValidSignature("order_unit", "pay_unit", "bad", secret), false);
});

test("order schema uses Customer references, snapshots and pending defaults", async () => {
  const order = new Order({ user: userId, items: [{ product: productId, name: "Keyboard", price: 2999, quantity: 1 }], shippingAddress: validateShippingAddress(address), totalAmount: 2999 });
  await order.validate();
  assert.equal(Order.schema.path("user").options.ref, "Customer");
  assert.equal(order.paymentStatus, "PENDING");
  assert.equal(order.status, "PENDING_PAYMENT");
});

test("payment configuration refuses missing or live credentials", () => {
  const before = { key: process.env.RAZORPAY_KEY_ID, secret: process.env.RAZORPAY_KEY_SECRET };
  try {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    assert.throws(() => realConfig.getTestCredentials(), /Test Mode/);
    process.env.RAZORPAY_KEY_ID = "rzp_live_unit";
    process.env.RAZORPAY_KEY_SECRET = secret;
    assert.throws(() => realConfig.getTestCredentials(), /Test Mode/);
  } finally {
    if (before.key === undefined) delete process.env.RAZORPAY_KEY_ID; else process.env.RAZORPAY_KEY_ID = before.key;
    if (before.secret === undefined) delete process.env.RAZORPAY_KEY_SECRET; else process.env.RAZORPAY_KEY_SECRET = before.secret;
  }
});

test("controller security and idempotence", async (t) => {
  const originals = { findById: Customer.findById, updateCustomer: Customer.updateOne, create: Order.create, updateOrder: Order.updateOne, findOne: Order.findOne, find: Order.find, startSession: mongoose.startSession };
  let saves = 0;
  let cartClears = 0;
  let failedOrders = 0;
  let savedInput;
  let ownedOrder;
  let activeSession;
  const reset = () => {
    saves = 0; cartClears = 0; failedOrders = 0; savedInput = null; gatewayCalls = []; gatewayFails = false;
    activeSession = { withTransaction: async (callback) => callback(), endSession: async () => {} };
    mongoose.startSession = async () => activeSession;
    Customer.findById = () => ({ populate: async () => ({ cart: [{ product, quantity: 2 }] }) });
    Customer.updateOne = async (filter, update, options) => { assert.equal(filter._id, userId); assert.deepEqual(update, { $set: { cart: [] } }); assert.equal(options.session, activeSession); cartClears++; return { matchedCount: 1 }; };
    Order.create = async (input) => { savedInput = input; return { ...input, _id: orderId, save: async () => { saves++; } }; };
    Order.updateOne = async () => { failedOrders++; };
    ownedOrder = { _id: orderId, user: userId, razorpayOrderId: "order_unit", paymentStatus: "PENDING", status: "PENDING_PAYMENT", save: async ({ session }) => { assert.equal(session, activeSession); saves++; } };
    Order.findOne = (filter) => { assert.equal(filter.user, userId); assert.equal(filter._id, orderId); return query(ownedOrder); };
  };
  try {
    await t.test("create ignores tampered totals and user ID; cart remains intact", async () => {
      reset(); const res = response();
      await controllers.createPaymentOrder({ user: { id: userId }, body: { shippingAddress: address, user: "attacker", totalAmount: 1, items: [] } }, res);
      assert.equal(res.code, 201); assert.equal(savedInput.user, userId); assert.equal(savedInput.totalAmount, 5998);
      assert.equal(gatewayCalls[0].amount, 599800); assert.equal(gatewayCalls[0].currency, "INR");
      assert.equal(res.data.key, "rzp_test_unit"); assert.equal(res.data.secret, undefined); assert.equal(cartClears, 0);
    });
    await t.test("gateway failure records failure without clearing cart", async () => {
      reset(); gatewayFails = true; const res = response();
      await controllers.createPaymentOrder({ user: { id: userId }, body: { shippingAddress: address } }, res);
      assert.equal(res.code, 502); assert.equal(cartClears, 0); assert.equal(failedOrders, 1);
    });
    await t.test("invalid shipping and stock stop before gateway calls", async () => {
      reset(); const res = response();
      await controllers.createPaymentOrder({ user: { id: userId }, body: { shippingAddress: { ...address, city: " " } } }, res);
      assert.equal(res.code, 400); assert.equal(gatewayCalls.length, 0);
      Customer.findById = () => ({ populate: async () => ({ cart: [{ product, quantity: 11 }] }) });
      const stockResponse = response();
      await controllers.createPaymentOrder({ user: { id: userId }, body: { shippingAddress: address } }, stockResponse);
      assert.equal(stockResponse.code, 409); assert.equal(gatewayCalls.length, 0);
    });
    await t.test("bad signature/order mismatch cannot mark paid or clear cart", async () => {
      reset(); const res = response();
      await controllers.verifyPayment({ user: { id: userId }, body: { ...paymentBody(), razorpay_signature: "0".repeat(64) } }, res);
      assert.equal(res.code, 400); assert.equal(saves, 0); assert.equal(cartClears, 0);
      const mismatch = response();
      await controllers.verifyPayment({ user: { id: userId }, body: { ...paymentBody(), razorpay_order_id: "order_other" } }, mismatch);
      assert.equal(mismatch.code, 400); assert.equal(cartClears, 0);
    });
    await t.test("another customer's order returns 404", async () => {
      reset(); ownedOrder = null; const res = response();
      await controllers.verifyPayment({ user: { id: userId }, body: paymentBody() }, res);
      assert.equal(res.code, 404); assert.equal(cartClears, 0);
      const details = response(); await controllers.getOrder({ user: { id: userId }, params: { id: orderId } }, details); assert.equal(details.code, 404);
    });
    await t.test("valid verification places the order; replay does not clear new cart", async () => {
      reset(); const req = { user: { id: userId }, body: paymentBody() }; const res = response();
      await controllers.verifyPayment(req, res);
      assert.equal(res.code, 200); assert.equal(ownedOrder.paymentStatus, "PAID"); assert.equal(ownedOrder.status, "PLACED");
      assert.equal(ownedOrder.razorpayPaymentId, "pay_unit"); assert.equal(cartClears, 1); assert.equal(saves, 1);
      await controllers.verifyPayment(req, response()); assert.equal(cartClears, 1); assert.equal(saves, 1);
    });
    await t.test("history filters by owner and sorts newest first", async () => {
      reset(); Order.find = (filter) => { assert.deepEqual(filter, { user: userId }); return { sort: async (sort) => { assert.deepEqual(sort, { createdAt: -1 }); return []; } }; };
      const res = response(); await controllers.getOrders({ user: { id: userId } }, res); assert.deepEqual(res.data.orders, []);
    });
  } finally {
    Customer.findById = originals.findById; Customer.updateOne = originals.updateCustomer;
    Order.create = originals.create; Order.updateOne = originals.updateOrder; Order.findOne = originals.findOne; Order.find = originals.find;
    mongoose.startSession = originals.startSession;
  }
});
