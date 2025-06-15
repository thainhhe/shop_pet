const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Pet = require("../models/Pet");
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
      .populate({
        path: "items.item",
        select: "name images price",
      })
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
    }).populate({
      path: "items.item",
      select: "name images price",
    });

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

      // Get user's cart and populate items
      const cart = await Cart.findOne({ user: req.user.userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Populate cart items manually to handle both products and pets
      const populatedItems = await Promise.all(
        cart.items.map(async (item) => {
          const Model = item.itemType === "pet" ? Pet : Product;
          const populatedItem = await Model.findById(item.item);
          return {
            ...item.toObject(),
            item: populatedItem,
          };
        })
      );

      // Validate stock availability for products and availability for pets
      for (const item of populatedItems) {
        if (!item.item) {
          return res.status(400).json({
            message: `Item not found`,
          });
        }

        if (item.itemType === "product") {
          if (!item.item.isActive) {
            return res.status(400).json({
              message: `Product ${item.item.name} is no longer available`,
            });
          }
          if (item.item.inventory.quantity < item.quantity) {
            return res.status(400).json({
              message: `Not enough stock for ${item.item.name}`,
            });
          }
        } else if (item.itemType === "pet") {
          if (item.item.status !== "available") {
            return res.status(400).json({
              message: `Pet ${item.item.name} is no longer available`,
            });
          }
        }
      }

      // Create order items
      const orderItems = populatedItems.map((item) => ({
        itemType: item.itemType,
        item: item.item._id,
        name: item.item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.item.images?.[0]?.url || "",
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

      // Update inventory/status
      for (const item of populatedItems) {
        if (item.itemType === "product") {
          await Product.findByIdAndUpdate(item.item._id, {
            $inc: { "inventory.quantity": -item.quantity },
          });
        } else if (item.itemType === "pet") {
          await Pet.findByIdAndUpdate(item.item._id, {
            status: "pending",
          });
        }
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      // Populate the order before sending response
      await order.populate({
        path: "items.item",
        select: "name images price",
      });

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

    // Restore inventory/status
    for (const item of order.items) {
      if (item.itemType === "product") {
        await Product.findByIdAndUpdate(item.item, {
          $inc: { "inventory.quantity": item.quantity },
        });
      } else if (item.itemType === "pet") {
        await Pet.findByIdAndUpdate(item.item, {
          status: "available",
        });
      }
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
