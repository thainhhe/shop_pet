const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    applicant: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    livingArrangement: {
      type: String,
      required: true,
    },
    hasOtherPets: {
      type: Boolean,
      default: false,
    },
    otherPetsDetails: {
      type: String,
    },
    hasChildren: {
      type: Boolean,
      default: false,
    },
    childrenAges: {
      type: String,
    },
    workSchedule: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    reasonForAdoption: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
    },
    references: [
      {
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
      },
    ],
    meetingSchedule: {
      date: Date,
      location: String,
      notes: String,
    },
    reviewNotes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    adoptionFee: {
      amount: {
        type: Number,
        default: 0,
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paymentDate: Date,
      paymentMethod: String,
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Middleware to update pet status when adoption status changes
adoptionSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
    try {
      const Pet = mongoose.model("Pet");
      const pet = await Pet.findById(this.pet);

      if (pet) {
        if (this.status === "approved") {
          pet.status = "pending_adoption";
        } else if (this.status === "completed") {
          pet.status = "adopted";
        } else if (this.status === "rejected" || this.status === "cancelled") {
          // Check if there are other pending or approved applications
          const otherActiveApplications = await mongoose
            .model("Adoption")
            .find({
              pet: this.pet,
              _id: { $ne: this._id },
              status: { $in: ["pending", "approved"] },
            });

          if (otherActiveApplications.length === 0) {
            pet.status = "available";
          }
        }

        await pet.save();
      }
    } catch (error) {
      console.error("Error updating pet status:", error);
    }
  }
  next();
});

const Adoption = mongoose.model("Adoption", adoptionSchema);

module.exports = Adoption;
