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

// GET /api/shop/rescue-stats
// Get dashboard statistics for rescue center (accessible by both shop_owner and rescue_center)
router.get('/rescue-stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only allow shop_owner and rescue_center
    if (!["shop_owner", "rescue_center"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }

    // Get all pets for the user
    const userPets = await Pet.find({ owner: userId });

    // Calculate rescue center specific stats
    const totalPets = userPets.length;
    const availablePets = userPets.filter(pet => pet.status === 'available').length;
    const pendingAdoptions = userPets.filter(pet => pet.status === 'pending').length;
    const adoptedPets = userPets.filter(pet => pet.status === 'adopted').length;

    res.json({
      totalPets,
      availablePets,
      pendingAdoptions,
      adoptedPets
    });

  } catch (error) {
    console.error("Error fetching rescue stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shop/rescue-pets
// Get all pets for rescue center (accessible by both shop_owner and rescue_center)
router.get('/rescue-pets', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only allow shop_owner and rescue_center
    if (!["shop_owner", "rescue_center"].includes(userRole)) {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }

    const pets = await Pet.find({ owner: userId }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    console.error("Error fetching rescue pets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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

// GET /api/shop/orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, orderNumber, userName } = req.query;
    const shopId = req.user.userId;

    // Lấy tất cả sản phẩm và pet của shop
    const shopProducts = await Product.find({ shop: shopId }).select('_id');
    const shopPets = await Pet.find({ owner: shopId }).select('_id');
    const productIds = shopProducts.map(p => p._id.toString());
    const petIds = shopPets.map(p => p._id.toString());

    // Tìm tất cả order có ít nhất 1 item là sản phẩm hoặc pet của shop
    const filter = {
      $or: [
        { 'items': { $elemMatch: { itemType: 'product', item: { $in: productIds } } } },
        { 'items': { $elemMatch: { itemType: 'pet', item: { $in: petIds } } } },
      ]
    };
    if (status) filter.status = status;
    if (orderNumber) filter.orderNumber = { $regex: orderNumber, $options: 'i' };
    let userIds = [];
    if (userName) {
      const users = await User.find({ name: { $regex: userName, $options: 'i' } }).select('_id');
      userIds = users.map(u => u._id);
      if (userIds.length > 0) {
        filter.user = { $in: userIds };
      } else {
        // Không tìm thấy user nào, trả về rỗng
        return res.json({
          orders: [],
          pagination: { current: Number.parseInt(page), pages: 0, total: 0 }
        });
      }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.item', 'name images price')
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
    console.error('Get shop orders error:', error);
    res.status(500).json({ message: 'Server error while fetching shop orders' });
  }
});

// Cập nhật trạng thái đơn hàng của shop
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Kiểm tra quyền: chỉ cho phép cập nhật nếu đơn hàng thuộc shop này
    const shopId = req.user.userId;
    const shopProducts = await Product.find({ shop: shopId }).select('_id');
    const shopPets = await Pet.find({ owner: shopId }).select('_id');
    const productIds = shopProducts.map(p => p._id.toString());
    const petIds = shopPets.map(p => p._id.toString());
    const isShopOrder = order.items.some(
      item =>
        (item.itemType === 'product' && productIds.includes(item.item.toString())) ||
        (item.itemType === 'pet' && petIds.includes(item.item.toString()))
    );
    if (!isShopOrder) return res.status(403).json({ message: "Not authorized for this order" });

    // Cập nhật trạng thái
    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update shop order status error:", error);
    res.status(500).json({ message: "Server error while updating order status" });
  }
});

// More routes will be added here

module.exports = router; 