const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Pet = require("../models/Pet");

// Middleware to check for shop_owner role
const isShopOwner = (req, res, next) => {
  if (req.user.role !== "shop_owner") {
    return res.status(403).json({ message: "Access denied. Not a shop owner." });
  }
  next();
};

router.use(auth, isShopOwner);

// GET /api/shop/stats
// Get dashboard statistics for the shop owner
router.get("/stats", async (req, res) => {
  try {
    const shopId = req.user.userId;

    // Get all products and pets for the shop
    const shopProducts = await Product.find({ shop: shopId });
    const shopPets = await Pet.find({ owner: shopId });

    // --- Calculate Stats ---

    // 1. Total Orders
    const shopProductIds = shopProducts.map(p => p._id);
    const totalSales = await Order.countDocuments({ "items.product": { $in: shopProductIds } });

    // 2. Total Inventory (Products + Pets)
    const productInventory = shopProducts.reduce((sum, product) => sum + product.inventory.quantity, 0);
    const petInventory = shopPets.filter(pet => pet.status === 'available').length;
    const totalInventory = productInventory + petInventory;

    res.json({
      totalSales,
      totalInventory,
      productCount: shopProducts.length,
      petCount: shopPets.length
    });

  } catch (error) {
    console.error("Error fetching shop stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shop/products
// Get all products for the shop owner
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ shop: req.user.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching shop products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shop/pets
// Get all pets for the shop owner
router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    console.error("Error fetching shop pets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// More routes will be added here

module.exports = router; 