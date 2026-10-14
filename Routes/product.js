const express = require("express");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
} = require("../Controllers/product.controllers.js");
const router = express.Router();

// here both are url same but HTTP is different

router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

module.exports = router;
