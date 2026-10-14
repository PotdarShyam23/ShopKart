const express = require("express");
const {
  logout,
  profile,
  loginCustomer,
  registerCustomer,
} = require("../Controllers/customer.controllers");
const authMiddleWare = require("../Middleware/auth.middleware");
const router = express.Router();
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", authMiddleWare, profile);
router.post("/logout", authMiddleWare, logout);

module.exports = router;
