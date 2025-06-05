const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Pet = require("../models/Pet");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/upload");

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
  upload.array("images", 10), // Allow up to 10 images
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

      // Parse JSON fields that come as strings from FormData
      let petData = { ...req.body };

      // Parse nested objects
      if (typeof petData.age === "string") {
        petData.age = JSON.parse(petData.age);
      }
      if (typeof petData.healthStatus === "string") {
        petData.healthStatus = JSON.parse(petData.healthStatus);
      }
      if (typeof petData.location === "string") {
        petData.location = JSON.parse(petData.location);
      }
      if (typeof petData.adoptionRequirements === "string") {
        petData.adoptionRequirements = JSON.parse(petData.adoptionRequirements);
      }
      if (typeof petData.personality === "string") {
        petData.personality = JSON.parse(petData.personality);
      }

      // Handle uploaded images
      const images = req.files
        ? req.files.map((file) => ({
            url: file.path,
            publicId: file.filename,
          }))
        : [];

      petData = {
        ...petData,
        owner: req.user.userId,
        ownerType: req.user.role === "shop_owner" ? "shop" : "rescue_center",
        images: images,
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

// Update pet
router.put(
  "/:id",
  auth,
  upload.array("images", 10),
  [
    body("name").optional().trim().isLength({ min: 1 }),
    body("species")
      .optional()
      .isIn(["dog", "cat", "bird", "fish", "rabbit", "hamster", "other"]),
    body("breed").optional().trim().isLength({ min: 1 }),
    body("gender").optional().isIn(["male", "female"]),
    body("size").optional().isIn(["small", "medium", "large", "extra_large"]),
    body("description").optional().trim().isLength({ min: 10 }),
    body("price").optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      console.log("=== UPDATE PET DEBUG ===");
      console.log("Pet ID:", req.params.id);
      console.log("User:", req.user);
      console.log("Request body keys:", Object.keys(req.body));
      console.log("Files:", req.files?.length || 0);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const pet = await Pet.findById(req.params.id);
      if (!pet) {
        console.log("Pet not found");
        return res.status(404).json({ message: "Pet not found" });
      }

      console.log("Pet owner:", pet.owner.toString());
      console.log("Current user:", req.user.userId);
      console.log("Owner match:", pet.owner.toString() === req.user.userId);

      // Check ownership
      if (pet.owner.toString() !== req.user.userId) {
        console.log("Authorization failed - not owner");
        return res.status(403).json({
          message: "Not authorized to update this pet",
          debug: {
            petOwner: pet.owner.toString(),
            currentUser: req.user.userId,
            match: pet.owner.toString() === req.user.userId,
          },
        });
      }

      // Parse JSON fields
      const updateData = { ...req.body };

      if (typeof updateData.age === "string") {
        updateData.age = JSON.parse(updateData.age);
      }
      if (typeof updateData.healthStatus === "string") {
        updateData.healthStatus = JSON.parse(updateData.healthStatus);
      }
      if (typeof updateData.location === "string") {
        updateData.location = JSON.parse(updateData.location);
      }
      if (typeof updateData.adoptionRequirements === "string") {
        updateData.adoptionRequirements = JSON.parse(
          updateData.adoptionRequirements
        );
      }
      if (typeof updateData.personality === "string") {
        updateData.personality = JSON.parse(updateData.personality);
      }

      // Handle new uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }));

        // Add new images to existing ones
        updateData.images = [...(pet.images || []), ...newImages];
      }

      console.log("Update data prepared, updating pet...");

      const updatedPet = await Pet.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate("owner", "name avatar");

      console.log("Pet updated successfully");

      res.json({
        message: "Pet updated successfully",
        pet: updatedPet,
      });
    } catch (error) {
      console.error("Update pet error:", error);
      res.status(500).json({ message: "Server error while updating pet" });
    }
  }
);

// Delete pet
router.delete("/:id", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this pet" });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Delete pet error:", error);
    res.status(500).json({ message: "Server error while deleting pet" });
  }
});

module.exports = router;
