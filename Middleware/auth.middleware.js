const jwt = require("jsonwebtoken");

const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // this will hive {id, jwt, exp}

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // then fect the id chech the the id match
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "Unauthorised",
    });
  }
};
// Checks the authentication cookie and identifies the customer.

module.exports = authMiddleWare;
