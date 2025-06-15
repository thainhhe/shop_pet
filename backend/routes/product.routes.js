const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

// Get all products with filtering and pagination
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("category")
      .optional()
      .isIn(["food", "toy", "accessory", "health", "grooming", "housing"]),
    query("petTypes").optional(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("brand").optional().trim(),
    query("search").optional().trim(),
    query("sort")
      .optional()
      .isIn(["newest", "price_low", "price_high", "rating", "popular"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 12,
        category,
        petTypes,
        minPrice,
        maxPrice,
        brand,
        search,
        sort = "newest",
      } = req.query;

      // Build filter object
      const filter = { isActive: true };

      if (category) filter.category = category;
      if (petTypes) filter.petTypes = { $in: [petTypes] };
      if (brand) filter.brand = new RegExp(brand, "i");

      // Price filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number.parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice);
      }

      // Search filter
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort object
      let sortObj = {};
      switch (sort) {
        case "price_low":
          sortObj = { price: 1 };
          break;
        case "price_high":
          sortObj = { price: -1 };
          break;
        case "rating":
          sortObj = { "ratings.average": -1 };
          break;
        case "popular":
          sortObj = { "ratings.count": -1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

      const products = await Product.find(filter)
        .populate("shop", "name avatar")
        .sort(sortObj)
        .skip(skip)
        .limit(Number.parseInt(limit));

      const total = await Product.countDocuments(filter);

      res.json({
        products,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error while fetching products" });
    }
  }
);

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shop",
      "name avatar phone email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
});

// Create new product (shop owners only)
router.post(
  "/",
  auth,
  upload.array("images", 10),
  [
    body("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Product name is required"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("category").isIn([
      "food",
      "toy",
      "accessory",
      "health",
      "grooming",
      "housing",
    ]),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("inventory.quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is authorized to create products
      if (req.user.role !== "shop_owner") {
        return res
          .status(403)
          .json({ message: "Not authorized to create products" });
      }

      const productData = { ...req.body };

      // Parse JSON string fields from FormData
      const fieldsToParse = ['discount', 'specifications', 'petTypes', 'tags'];
      fieldsToParse.forEach(field => {
        if (productData[field] && typeof productData[field] === 'string') {
          try {
            productData[field] = JSON.parse(productData[field]);
          } catch(e) {
            console.error(`Error parsing ${field}:`, e);
          }
        }
      });
      
      // Handle inventory separately as it's a nested object but not stringified
       if (productData['inventory.quantity']) {
        productData.inventory = { quantity: Number(productData['inventory.quantity']) };
        delete productData['inventory.quantity'];
      }

      // Handle uploaded images
      const images = req.files
        ? req.files.map((file) => {
            const url = process.env.NODE_ENV === 'production'
              ? file.path // Cloudinary path
              : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`; // Local path
            return { url, publicId: file.filename };
          })
        : [];

      productData.images = images;
      productData.shop = req.user.userId;

      const product = new Product(productData);
      await product.save();

      const populatedProduct = await Product.findById(product._id).populate(
        "shop",
        "name avatar"
      );

      res.status(201).json({
        message: "Product created successfully",
        product: populatedProduct,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Server error while creating product" });
    }
  }
);

// Update product
router.put("/:id", auth, upload.array("images", 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns this product
    if (product.shop.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    const updateData = { ...req.body };
    
    // Parse JSON string fields from FormData
    const fieldsToParse = ['discount', 'specifications', 'petTypes', 'tags'];
    fieldsToParse.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch(e) {
          console.error(`Error parsing ${field}:`, e);
        }
      }
    });
    
    // Handle inventory separately
    if (updateData['inventory.quantity']) {
        updateData.inventory = { quantity: Number(updateData['inventory.quantity']) };
        delete updateData['inventory.quantity'];
    }
    
    // 1. Handle new image uploads
    const newImages = req.files ? req.files.map(file => {
      const url = process.env.NODE_ENV === 'production'
        ? file.path
        : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return { url, publicId: file.filename };
    }) : [];

    // 2. Handle image deletions
    let imagesToDelete = [];
    if (req.body.deleteImages) {
        imagesToDelete = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
    }
    
    // Filter out deleted images from the existing list
    const remainingImages = product.images.filter(
      (img) => !imagesToDelete.includes(img.publicId)
    );

    // Combine remaining and new images
    updateData.images = [...remainingImages, ...newImages];
    
    // TODO: Actually delete files from Cloudinary or local storage
    // This requires a separate helper function for safety.
    // For now, they are just removed from the database record.

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("shop", "name avatar");

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error while updating product" });
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns this product
    if (product.shop.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    // Check if the product is active (available) before deleting
    if (!product.isActive) {
      return res
        .status(400)
        .json({ message: "Cannot delete an inactive product." });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
});

module.exports = router;
