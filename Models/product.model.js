const mongoose = require("mongoose");

// it create the blueprint only not the actual model u cant do find and create function in this

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timeStamps: true,
  },
);

// this is the actual model where we can don the operation in it

// in model onky we can use opeartios and in schema it just a rules how the model look like

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
