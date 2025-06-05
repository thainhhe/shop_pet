const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Token exists:", !!token);
    console.log(
      "Token preview:",
      token ? token.substring(0, 20) + "..." : "none"
    );

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ message: "Token is not valid" });
    }

    console.log("User found:", {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    console.log("Auth successful, proceeding...");
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
