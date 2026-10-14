const Customer = require("../Models/customer.model.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils/genrateTokens.js");
const jwt = require("jsonwebtoken");

// authentication

// who are u ? check the identity like JWT bycrpt compare at the time of login

// authorization

// are u allowed to perform this activity ?

// REGISTER

const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Check duplicate email

    const existingCustomer = await Customer.findOne({
      email,
    });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password

    // gebratinh hash passord only ine way cant undo it

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // Never send password
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN
// Creates a customer account after validating the registration details.

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer

    const customer = await Customer.findOne({
      email,
    });

    // Same message for wrong email OR wrong password
    // tell him to sign up
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password

    // here we will compare bcs user put pass 123 covert the pass into  hash just compare with DB hash passowrd

    // so in signup chnag the pass int hash and in login just comapre

    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT

    const token = generateToken(customer._id);

    // Store JWT in HttpOnly cookie
    res.cookie("token", token, {
      // only http not browser request
      httpOnly: true,
      // get from env
      secure: process.env.NODE_ENV === "production",
      // not cross site cookies stays in same site
      sameSite: "strict",
      // can alive max 1 day
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get the profile
// Checks the customer’s credentials and signs them in.

const profile = async (req, res) => {
  try {
    const profileId = await Customer.findById(req.user.id).select("-password");
    if (!profileId) {
      return res.status(401).json({
        success: false,
        message: "Customer Not Found",
      });
    }
    res.status(200).json(profileId);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "Server Not Load",
    });
  }
};

// logout
// Returns the logged-in customer’s profile.

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).send({
    success: true,
    respone: "Customer Successfully Logout",
  });
};
// Signs the customer out by clearing the authentication cookie.

module.exports = {
  logout,
  profile,
  loginCustomer,
  registerCustomer,
};
