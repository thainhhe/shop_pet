const express = require("express");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Pet = require("../models/Pet");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: "items.item",
      select: "name price images inventory isActive status",
    });

    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products or out of stock
    cart.items = cart.items.filter((item) => {
      if (item.itemType === "product") {
        return (
          item.item &&
          item.item.isActive &&
          item.item.inventory.quantity > 0
        );
      } else if (item.itemType === "pet") {
        return (
          item.item &&
          item.item.status === "available"
        );
      }
      return false;
    });

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
    body("itemType").isIn(["product", "pet"]).withMessage("Invalid item type"),
    body("itemId").isMongoId().withMessage("Invalid item ID"),
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

      const { itemType, itemId, quantity } = req.body;

      // Check if item exists and is available
      let item;
      if (itemType === "product") {
        item = await Product.findById(itemId);
        if (!item || !item.isActive) {
          return res
            .status(404)
            .json({ message: "Product not found or unavailable" });
        }
        if (item.inventory.quantity < quantity) {
          return res.status(400).json({ message: "Not enough stock available" });
        }
      } else if (itemType === "pet") {
        item = await Pet.findById(itemId);
        if (!item || item.status !== "available") {
          return res
            .status(404)
            .json({ message: "Pet not found or unavailable" });
        }
        if (quantity > 1) {
          return res.status(400).json({ message: "Can only add one pet at a time" });
        }
      }

      let cart = await Cart.findOne({ user: req.user.userId });
      if (!cart) {
        cart = new Cart({ user: req.user.userId, items: [] });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.item.toString() === itemId && item.itemType === itemType
      );

      if (existingItemIndex > -1) {
        // Update quantity
        if (itemType === "product") {
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;
          if (newQuantity > item.inventory.quantity) {
            return res
              .status(400)
              .json({ message: "Not enough stock available" });
          }
          cart.items[existingItemIndex].quantity = newQuantity;
        } else {
          return res.status(400).json({ message: "Pet is already in cart" });
        }
      } else {
        // Add new item
        cart.items.push({
          itemType,
          item: itemId,
          quantity,
          price: item.price,
        });
      }

      await cart.save();
      await cart.populate({
        path: "items.item",
        select: "name price images inventory isActive status",
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
        const product = await Product.findById(cart.items[itemIndex].item);
        if (quantity > product.inventory.quantity) {
          return res
            .status(400)
            .json({ message: "Not enough stock available" });
        }
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      await cart.populate({
        path: "items.item",
        select: "name price images inventory isActive status",
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
      path: "items.item",
      select: "name price images inventory isActive status",
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
