const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Pet = require("../models/Pet");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all pets with filtering and pagination
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("species")
      .optional()
      .isIn(["dog", "cat", "bird", "fish", "rabbit", "hamster", "other"]),
    query("size").optional().isIn(["small", "medium", "large", "extra_large"]),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("city").optional().trim(),
    query("isForAdoption").optional().isBoolean(),
    query("search").optional().trim(),
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
        species,
        size,
        minPrice,
        maxPrice,
        city,
        isForAdoption,
        search,
      } = req.query;

      // Build filter object
      const filter = { status: "available" };

      if (species) filter.species = species;
      if (size) filter.size = size;
      if (city) filter["location.city"] = new RegExp(city, "i");
      if (isForAdoption !== undefined)
        filter.isForAdoption = isForAdoption === "true";

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

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

      const pets = await Pet.find(filter)
        .populate("owner", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit));

      const total = await Pet.countDocuments(filter);

      res.json({
        pets,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
        },
      });
    } catch (error) {
      console.error("Get pets error:", error);
      res.status(500).json({ message: "Server error while fetching pets" });
    }
  }
);

// Get single pet
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate(
      "owner",
      "name avatar phone email"
    );

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ pet });
  } catch (error) {
    console.error("Get pet error:", error);
    res.status(500).json({ message: "Server error while fetching pet" });
  }
});

// Create new pet (shop owners and rescue centers only)
router.post(
  "/",
  auth,
  [
    body("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Pet name is required"),
    body("species").isIn([
      "dog",
      "cat",
      "bird",
      "fish",
      "rabbit",
      "hamster",
      "other",
    ]),
    body("breed").trim().isLength({ min: 1 }).withMessage("Breed is required"),
    body("gender").isIn(["male", "female"]),
    body("size").isIn(["small", "medium", "large", "extra_large"]),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("price").optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is authorized to create pets
      if (!["shop_owner", "rescue_center"].includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Not authorized to create pets" });
      }

      const petData = {
        ...req.body,
        owner: req.user.userId,
        ownerType: req.user.role === "shop_owner" ? "shop" : "rescue_center",
      };

      const pet = new Pet(petData);
      await pet.save();

      const populatedPet = await Pet.findById(pet._id).populate(
        "owner",
        "name avatar"
      );

      res.status(201).json({
        message: "Pet created successfully",
        pet: populatedPet,
      });
    } catch (error) {
      console.error("Create pet error:", error);
      res.status(500).json({ message: "Server error while creating pet" });
    }
  }
);

module.exports = router;
