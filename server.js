const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const customerRoutes = require("./Routes/rotes.js");
const productRoutes = require("./Routes/product.js");
const wishlistRoutes = require("./Routes/wishlist.js");
const cartRoutes = require("./Routes/cart.js");
const orderRoutes = require("./Routes/order.js");
const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json());

// so express can understand req.user.token
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes

const apiRouter = express.Router();
apiRouter.use("/customer", customerRoutes);

// it just tell anything have a url containing the product shift to the product route

apiRouter.use("/product", productRoutes);
apiRouter.use("/wishlist", wishlistRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/orders", orderRoutes);
app.use("/api", apiRouter);

// Keep the existing local frontend and Postman URLs working in development.
if (!isProduction) {
  app.use(apiRouter);
}

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.get("/health", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: "Database unavailable" });
  }
  return res.status(200).json({ success: true, message: "Service ready" });
});
// Lets Render check that the service and database are ready.

if (isProduction) {
  const frontendDirectory = path.join(__dirname, "auth", "dist");
  app.use(express.static(frontendDirectory));
  app.get("/{*page}", (req, res, next) => {
    if (path.extname(req.path)) {
      return next();
    }
    return res.sendFile(path.join(frontendDirectory, "index.html"));
  });
  // Serves React pages when users open or refresh a page directly.
}

// Connect MongoDB
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
      const port = process.env.PORT || 5000;
      app.listen(port, "0.0.0.0", () => {
        console.log(`Server listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
      process.exitCode = 1;
    });
}

module.exports = app;
