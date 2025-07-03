const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendPasswordResetEmail, generateResetToken, hashResetToken } = require("../services/emailService");
const crypto = require("crypto");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["user", "shop_owner", "rescue_center"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        phone,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        address: user.address,
        profile: user.profile,
        isVerified: user.isVerified,
        premiumSubscription: user.premiumSubscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// Update user profile
router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("address.street").optional().trim(),
    body("address.city").optional().trim(),
    body("address.district").optional().trim(),
    body("address.ward").optional().trim(),
    body("address.zipCode").optional().trim(),
    body("profile.lifestyle")
      .optional()
      .isIn(["active", "moderate", "quiet"])
      .withMessage("Invalid lifestyle option"),
    body("profile.livingSpace")
      .optional()
      .isIn(["apartment", "house", "farm"])
      .withMessage("Invalid living space option"),
    body("profile.experience")
      .optional()
      .isIn(["beginner", "intermediate", "expert"])
      .withMessage("Invalid experience level"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updateData = {};

      // Update basic fields
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.avatar) updateData.avatar = req.body.avatar;

      // Update address
      if (req.body.address) {
        updateData.address = {
          ...req.body.address,
        };
      }

      // Update profile
      if (req.body.profile) {
        updateData.profile = {
          ...req.body.profile,
        };
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          address: user.address,
          profile: user.profile,
          isVerified: user.isVerified,
          premiumSubscription: user.premiumSubscription,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error while updating profile" });
    }
  }
);

// Forgot Password
router.post("/forgot-password", [
  body("email").isEmail().withMessage("Please provide a valid email"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists or not for security
      return res.json({
        message: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu."
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);

    // Set reset token and expiration (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Send reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        message: "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."
      });
    }

    res.json({
      message: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Lỗi server khi xử lý yêu cầu đặt lại mật khẩu" });
  }
});

// Reset Password
router.post("/reset-password/:token", [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = hashResetToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      message: "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu" });
  }
});

// Verify Reset Token
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashResetToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
      });
    }

    res.json({
      message: "Token hợp lệ",
      email: user.email // Return email for display purposes
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Lỗi server khi xác thực token" });
  }
});

module.exports = router;
