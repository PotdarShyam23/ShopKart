const express = require("express");
const authMiddleWare = require("../Middleware/auth.middleware.js");
const {
  addWishlist,
  getWishlist,
  removeWishlist,
} = require("../Controllers/wishlist.controllers.js");
const router = express.Router();
router.post("/:productId", authMiddleWare, addWishlist);
router.get("/", authMiddleWare, getWishlist);
router.delete("/:productId", authMiddleWare, removeWishlist);

module.exports = router;
