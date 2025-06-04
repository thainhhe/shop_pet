const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["food", "toy", "accessory", "health", "grooming", "housing"],
    },
    subcategory: String,
    petTypes: [
      {
        type: String,
        enum: ["dog", "cat", "bird", "fish", "rabbit", "hamster", "all"],
      },
    ],
    brand: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: Number,
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      validUntil: Date,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    specifications: {
      weight: String,
      dimensions: String,
      material: String,
      ageRange: String,
      ingredients: String,
    },
    inventory: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
productSchema.index({ category: 1, petTypes: 1, price: 1 });
productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
