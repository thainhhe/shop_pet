const express = require("express");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: "items.product",
      select: "name price images inventory isActive",
    });

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products or out of stock
    cart.items = cart.items.filter(
      (item) =>
        item.product &&
        item.product.isActive &&
        item.product.inventory.quantity > 0
    );

    await cart.save();

    res.json({ cart });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

// Add item to cart
router.post(
  "/add",
  auth,
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, quantity } = req.body;

      // Check if product exists and is available
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res
          .status(404)
          .json({ message: "Product not found or unavailable" });
      }

      if (product.inventory.quantity < quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }

      let cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        cart = new Cart({ user: req.user.userId, items: [] });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.inventory.quantity) {
          return res
            .status(400)
            .json({ message: "Not enough stock available" });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }

      await cart.save();
      await cart.populate({
        path: "items.product",
        select: "name price images inventory isActive",
      });

      res.json({
        message: "Item added to cart successfully",
        cart,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Server error while adding to cart" });
    }
  }
);

// Update cart item quantity
router.put(
  "/update/:itemId",
  auth,
  [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === itemId
      );
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      if (quantity === 0) {
        // Remove item from cart
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock availability
        const product = await Product.findById(cart.items[itemIndex].product);
        if (quantity > product.inventory.quantity) {
          return res
            .status(400)
            .json({ message: "Not enough stock available" });
        }
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      await cart.populate({
        path: "items.product",
        select: "name price images inventory isActive",
      });

      res.json({
        message: "Cart updated successfully",
        cart,
      });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ message: "Server error while updating cart" });
    }
  }
);

// Remove item from cart
router.delete("/remove/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price images inventory isActive",
    });

    res.json({
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error while removing from cart" });
  }
});

// Clear cart
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error while clearing cart" });
  }
});

module.exports = router;
