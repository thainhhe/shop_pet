const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["product", "pet"],
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "itemType",
    required: true,
  },
  // Keep these fields for denormalized data
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: function () {
        return (
          "ORD" +
          Date.now() +
          Math.random().toString(36).substr(2, 5).toUpperCase()
        );
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "zalopay", "bank_transfer"],
      default: "cod",
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      district: String,
      ward: String,
      zipCode: String,
    },
    notes: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving

module.exports = mongoose.model("Order", orderSchema);
