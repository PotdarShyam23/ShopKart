const mongoose = require("mongoose");
const Product = require("../Models/product.model.js");
const Customer = require("../Models/customer.model.js");

// adding the product into the cart

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // req.body can be controlled by user so req.user.id get verifies by JWT

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not exists",
      });
    }

    //checking existing

    const existingProduct = customer.cart.find((c) =>
      c.product.equals(productId),
    );
    let newQuantity = 1;
    if (existingProduct) {
      newQuantity = existingProduct.quantity + 1;
    }
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Not enough products",
      });
    }
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: 1,
      });
    }
    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name price image category stock",
    });
    return res.status(200).json({
      success: true,
      message: "Product added to the cart",
      cart: customer.cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get controller
// Adds the selected product to the cart.

const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not found",
      });
    }
    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Returns the customer’s cart with product details.

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Object ID",
      });
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "quantity exceed the stock",
      });
    }
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not found",
      });
    }
    const cartItem = customer.cart.find((item) =>
      item.product.equals(productId),
    );
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in the cart",
      });
    }
    cartItem.quantity = quantity;
    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name description image stock price category",
    });
    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// reomve from the cart
// Updates a cart item’s quantity after validating stock.

const removeCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
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
      return res.status(404).json({
        success: false,
        message: "customer not found",
      });
    }
    const productExists = customer.cart.find((item) =>
      item.product.equals(productId),
    );
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product did not exists in the cart",
      });
    }
    customer.cart.pull(productExists._id);
    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name description price image category stock",
    });
    return res.status(200).json({
      success: true,
      message: "Product removed from the cart",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// Removes the selected product from the customer’s cart.

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCart,
};
