const jwt = require("jsonwebtoken");
const genrateToken = (customerId) => {
  return jwt.sign(
    {
      id: customerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
      // expires in 1d
    },
  );
};
// Handles genrate token.

module.exports = genrateToken;
