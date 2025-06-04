const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.socialLogin;
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "shop_owner", "rescue_center", "admin"],
      default: "user",
    },
    address: {
      street: String,
      city: String,
      district: String,
      ward: String,
      zipCode: String,
    },
    profile: {
      lifestyle: {
        type: String,
        enum: ["active", "moderate", "quiet"],
        default: "moderate",
      },
      livingSpace: {
        type: String,
        enum: ["apartment", "house", "farm"],
        default: "apartment",
      },
      experience: {
        type: String,
        enum: ["beginner", "intermediate", "expert"],
        default: "beginner",
      },
      preferences: {
        petTypes: [String],
        sizes: [String],
        ages: [String],
      },
    },
    socialLogin: {
      provider: String,
      providerId: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    premiumSubscription: {
      isActive: {
        type: Boolean,
        default: false,
      },
      expiresAt: Date,
      adoptionsRemaining: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
