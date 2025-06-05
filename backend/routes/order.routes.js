const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user.userId };
    if (status) filter.status = status;

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const orders = await Order.find(filter)
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error while fetching order" });
  }
});

// Create order from cart
router.post(
  "/create",
  auth,
  [
    body("shippingAddress.name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Name is required"),
    body("shippingAddress.phone")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone is required"),
    body("shippingAddress.address")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Address is required"),
    body("paymentMethod")
      .isIn(["cod", "momo", "zalopay", "bank_transfer"])
      .withMessage("Invalid payment method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { shippingAddress, paymentMethod, notes } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ user: req.user.userId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate stock availability
      for (const item of cart.items) {
        if (!item.product.isActive) {
          return res
            .status(400)
            .json({
              message: `Product ${item.product.name} is no longer available`,
            });
        }
        if (item.product.inventory.quantity < item.quantity) {
          return res
            .status(400)
            .json({ message: `Not enough stock for ${item.product.name}` });
        }
      }

      // Create order items
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images?.[0]?.url || "",
      }));

      // Create order
      const order = new Order({
        user: req.user.userId,
        items: orderItems,
        totalAmount: cart.totalAmount,
        paymentMethod,
        shippingAddress,
        notes,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      await order.save();

      // Update product inventory
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { "inventory.quantity": -item.quantity },
        });
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      await order.populate("items.product", "name images");

      res.status(201).json({
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Server error while creating order" });
    }
  }
);

// Cancel order
router.put("/cancel/:id", auth, async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || "Cancelled by customer";

    await order.save();

    // Restore product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { "inventory.quantity": item.quantity },
      });
    }

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
});

module.exports = router;
