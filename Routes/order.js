const express = require("express");
const authMiddleWare = require("../Middleware/auth.middleware.js");
const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrder,
} = require("../Controllers/order.controllers.js");
const router = express.Router();
router.use(authMiddleWare);
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getOrders);
router.get("/:id", getOrder);

module.exports = router;
