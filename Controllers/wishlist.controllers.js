const mongoose = require("mongoose");
const Product = require("../Models/product.model.js");
const Customer = require("../Models/customer.model");

// path = where are the IDs?
//  ref = which model do those IDs belong to?
//  populate() = replace those IDs with document information in the returned data

const addWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid ObjectId is not present",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "No longer Exists",
      });
    }
    const alreadyExist = customer.wishlist.some((savedProductId) =>
      savedProductId.equals(product._id),
    );
    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "The Product ALready Exists",
      });
    } else {
      customer.wishlist.push(product._id);
      await customer.save();
      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

// path tells what to find in the schema wishlist ref tell design smtg like this populate change the query gives the desired output
// Adds a product to the customer’s wishlist.

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate({
      path: "wishlist",
      select: "name description category image price stock",
    });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      message: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Loads the wishlist and updates its loading or error state.

const removeWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not found",
      });
    }
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not exists",
      });
    }
    const existInWishlist = customer.wishlist.some((savedId) =>
      savedId.equals(productId),
    );
    if (!existInWishlist) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    } else {
      // just remove the ID from the wishlist array if id matches

      customer.wishlist.pull(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
      });

      // save the change in MongoDB
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Removes a wishlist product and updates the displayed list.

module.exports = {
  addWishlist,
  getWishlist,
  removeWishlist,
};
