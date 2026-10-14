const mongoose = require("mongoose");
const Customer = require("../Models/customer.model.js");
const Order = require("../Models/order.model.js");
const { getRazorpay, getTestCredentials } = require("../Config/razorpay.js");
const {
  orderError,
  validateShippingAddress,
  buildOrderSnapshot,
  hasValidSignature,
} = require("../Utils/orderValidation.js");


// it will create the payment order 
const createPaymentOrder = async (req, res) => {
  let order;
  try {

    // check the shipping address 
    const shippingAddress = validateShippingAddress(req.body?.shippingAddress);

    // check customer populate the cart
    const customer = await Customer.findById(req.user.id).populate(
      "cart.product",
    );
    if (!customer) {
      // it will stop the function and went to nearest catch block
      throw orderError("Customer not found.", 404);
    }

    // Use current database prices instead of totals sent by the browser.

    const { items, totalAmount, amount } = buildOrderSnapshot(customer.cart);
    const { client, key } = getRazorpay();
    // saving in mongoDB
    order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      totalAmount,
    });
    // from razorpay
    let paymentOrder;
    try {
      // doing in razorpay razopray create payment id and plus chack with order id 
      paymentOrder = await client.orders.create({
        amount,
        currency: "INR",
        // receipet connects payemnt to that order id 
        receipt: "shopkart_" + order._id.toString(),
      });
      if (
        !paymentOrder.id ||
        Number(paymentOrder.amount) !== amount ||
        paymentOrder.currency !== "INR"
      ) {
        throw new Error("Unexpected gateway response");
      }
    } catch {
      throw orderError(
        "Razorpay could not create a payment order. Your cart is unchanged; please try again.",
        502,
      );
    }
    // if all matces then commit 
    order.razorpayOrderId = paymentOrder.id;
    await order.save();
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: paymentOrder.id,
      amount,
      currency: "INR",
      key,
    });
  } catch (error) {
    // if now wny errors comes just schange the status pending to failed 
    if (order) {
      try {
        await Order.updateOne(
          {
            _id: order._id,
            paymentStatus: "PENDING",
          },
          {
            $set: {
              paymentStatus: "FAILED",
            },
          },
        );
      } catch {
        // Preserve the cart even if recording the order failure fails.
      }
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to process the order. Please try again.",
    });
  }
};
// Validates shipping and cart data, then creates pending ShopKart and Razorpay orders.

const verifyPayment = async (req, res) => {
  let session;
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      // {} hepls in destructing 
    } = req.body || {};
    if (
      typeof shopKartOrderId !== "string" ||
      !mongoose.isValidObjectId(shopKartOrderId)
    ) {
      throw orderError("Invalid ShopKart order ID.");
    }

    // all payment fields required 
    const paymentFields = [
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    ];
    for (const value of paymentFields) {
      if (typeof value !== "string" || !value.trim()) {
        throw orderError(
          "Payment order ID, payment ID and signature are required.",
        );
      }
    }
    // finedn thw owned id 
    const ownedOrder = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user.id,
    });
    if (!ownedOrder) {
      throw orderError("Order not found.", 404);
    }
    // check the bith ids 
    if (
      !ownedOrder.razorpayOrderId ||
      ownedOrder.razorpayOrderId !== razorpay_order_id
    ) {
      throw orderError("Payment order ID does not match.");
    }
    const { secret } = getTestCredentials();
    // now check HMAC signature
    const validSignature = hasValidSignature(
      ownedOrder.razorpayOrderId,
      razorpay_payment_id,
      razorpay_signature,
      secret,
    );
    if (!validSignature) {
      throw orderError(
        "Payment signature verification failed. Your cart is unchanged.",
      );
    }
    if (ownedOrder.paymentStatus === "PAID") {
      if (ownedOrder.razorpayPaymentId !== razorpay_payment_id) {
        throw orderError("This order was paid with a different payment.", 409);
      }
      return res.status(200).json({
        success: true,
        order: ownedOrder,
      });
    }
    let confirmedOrder;

    // Commit payment and cart clearing together; retries must not clear a new cart.
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: shopKartOrderId,
        user: req.user.id,
      }).session(session);
      if (!order) {
        throw orderError("Order not found.", 404);
      }
      if (order.paymentStatus === "PAID") {
        if (order.razorpayPaymentId !== razorpay_payment_id) {
          throw orderError(
            "This order was paid with a different payment.",
            409,
          );
        }
        confirmedOrder = order;
        return;
      }
      if (
        order.paymentStatus !== "PENDING" ||
        order.razorpayOrderId !== razorpay_order_id
      ) {
        throw orderError("This order is not awaiting payment.", 409);
      }
      order.paymentStatus = "PAID";
      order.status = "PLACED";
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save({
        session,
      });
      const customerUpdate = await Customer.updateOne(
        {
          _id: req.user.id,
        },
        {
          $set: {
            cart: [],
          },
        },
        {
          session,
        },
      );
      if (customerUpdate.matchedCount !== 1) {
        throw orderError("Customer not found.", 404);
      }
      confirmedOrder = order;
    });
    // The transaction callback places the order and clears the cart as one operation.

    return res.status(200).json({
      success: true,
      order: confirmedOrder,
    });
  } catch (error) {
    if (error.code === 20) {
      return res.status(503).json({
        success: false,
        message:
          "Payment verification requires MongoDB Atlas or a replica set. Your cart is unchanged.",
      });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to process the order. Please try again.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
// Verifies payment ownership and signature, places the order, and safely clears the cart.

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to process the order. Please try again.",
    });
  }
};
// Returns only the logged-in customer's orders, with the newest orders first.

const getOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw orderError("Invalid order ID.");
    }
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) {
      throw orderError("Order not found.", 404);
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to process the order. Please try again.",
    });
  }
};
// Returns one order only when it belongs to the logged-in customer.

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrder,
};
