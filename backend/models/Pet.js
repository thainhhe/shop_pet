const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      enum: ["dog", "cat", "bird", "fish", "rabbit", "hamster", "other"],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      value: Number,
      unit: {
        type: String,
        enum: ["months", "years"],
        default: "months",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    size: {
      type: String,
      enum: ["small", "medium", "large", "extra_large"],
      required: true,
    },
    color: String,
    weight: Number,
    description: {
      type: String,
      required: true,
    },
    personality: [String],
    healthStatus: {
      vaccinated: {
        type: Boolean,
        default: false,
      },
      neutered: {
        type: Boolean,
        default: false,
      },
      healthCertificate: String,
      medicalHistory: String,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    videos: [
      {
        url: String,
        publicId: String,
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    isForAdoption: {
      type: Boolean,
      default: false,
    },
    isForSale: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted", "sold"],
      default: "available",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerType: {
      type: String,
      enum: ["shop", "rescue_center"],
      required: true,
    },
    location: {
      city: String,
      district: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    adoptionRequirements: {
      minAge: Number,
      experienceRequired: Boolean,
      homeVisit: Boolean,
      followUpRequired: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
petSchema.index({ species: 1, breed: 1, size: 1, "location.city": 1 });
petSchema.index({ name: "text", description: "text", breed: "text" });

module.exports = mongoose.model("Pet", petSchema);
