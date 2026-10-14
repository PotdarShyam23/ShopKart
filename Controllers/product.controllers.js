const mongoose = require("mongoose");
const Product = require("../Models/product.model.js");

//  for create product we use req.body as we need the body to creat

// for specific use req.params.id for specific thing s

// for all use just get onlly HTTp header

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });
    return res.status(201).json({
      success: true,
      message: "Product created successfully ",
      // it tells the user that the product has this fields
      product: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Creates a product from the submitted product details.

const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (category) {
      filter.category = category;
    }
    const products = await Product.find(filter).select(
      // it must be in a string or use ({ name: 1 which tell name field is included otherwise the variable method is deprecated })
      "name description price category image stock",
    );
    return res.status(200).json({
      success: true,
      length: products.length,
      products,
    });
  } catch (error) {
    // here 500 bsc this is not a invalid error or invalid input it is a databse error or server error

    return res.status(500).json({
      success: false,
      message: "Unable to fecth the Products",
    });
  }
};
// Returns products matching the search and category filters.

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Id",
      });
    }
    const product = await Product.findById(id).select({
      name: 1,
      description: 1,
      price: 1,
      category: 1,
      image: 1,
      stock: 1,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found",
      });
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch",
    });
  }
};
// Returns the product matching the requested ID.

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
};
