const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const Product = require("../models/Product");

const router = express.Router();

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Not an admin." });
  }
  next();
};

router.use(auth, isAdmin);

// --- USER MANAGEMENT ---
// Lấy danh sách user (có phân trang, lọc theo role)
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

// Cập nhật thông tin user (trừ password)
router.put("/users/:id", async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating user" });
  }
});

// Xóa user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

// Thay đổi role user
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "shop_owner", "rescue_center"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Cannot set role to admin." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating user role" });
  }
});

// --- ORDER MANAGEMENT ---
// Lấy danh sách order (lọc theo trạng thái, phân trang)
router.get("/orders", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});

// Cập nhật trạng thái order
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating order status" });
  }
});

// --- DASHBOARD STATS ---
// Thống kê số lượng user, sản phẩm, đơn hàng trong 7 ngày và 30 ngày gần nhất
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    // User
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: monthAgo } });

    // Product
    const productsLast7Days = await Product.countDocuments({ createdAt: { $gte: weekAgo } });
    const productsLast30Days = await Product.countDocuments({ createdAt: { $gte: monthAgo } });

    // Order
    const ordersLast7Days = await Order.countDocuments({ createdAt: { $gte: weekAgo } });
    const ordersLast30Days = await Order.countDocuments({ createdAt: { $gte: monthAgo } });

    res.json({
      users: { last7Days: usersLast7Days, last30Days: usersLast30Days },
      products: { last7Days: productsLast7Days, last30Days: productsLast30Days },
      orders: { last7Days: ordersLast7Days, last30Days: ordersLast30Days },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching stats" });
  }
});

module.exports = router;
