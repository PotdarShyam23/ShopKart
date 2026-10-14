const express = require("express");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCart,
} = require("../Controllers/addCart.controllers.js");
const middleWare = require("../Middleware/auth.middleware.js");
const router = express.Router();
router.post("/:productId", middleWare, addToCart);
//patch
router.get("/", middleWare, getCart);
router.patch("/:productId", middleWare, updateCartQuantity);
router.delete("/:productId", middleWare, removeCart);

module.exports = router;
