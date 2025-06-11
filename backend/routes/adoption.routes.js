const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Adoption = require("../models/Adoption");
const Pet = require("../models/Pet");
const User = require("../models/User");

// Submit adoption application
router.post("/apply/:petId", auth, async (req, res) => {
  try {
    const petId = req.params.petId;

    // Validate pet ID
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "ID thú cưng không hợp lệ" });
    }

    // Check if pet exists and is available
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Không tìm thấy thú cưng" });
    }

    if (pet.status !== "available") {
      return res
        .status(400)
        .json({ message: "Thú cưng này không có sẵn để nhận nuôi" });
    }

    // Check if user already has a pending application for this pet
    const existingApplication = await Adoption.findOne({
      pet: petId,
      "applicant.user": req.user.id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "Bạn đã có đơn đăng ký nhận nuôi thú cưng này" });
    }

    // Create new adoption application
    const {
      livingArrangement,
      hasOtherPets,
      otherPetsDetails,
      hasChildren,
      childrenAges,
      workSchedule,
      experience,
      reasonForAdoption,
      emergencyContact,
      references,
    } = req.body;

    // Get user info
    const user = await User.findById(req.user.id).select("name email phone");

    const newApplication = new Adoption({
      pet: petId,
      applicant: {
        user: req.user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || req.body.applicant?.phone || "",
      },
      livingArrangement,
      hasOtherPets,
      otherPetsDetails,
      hasChildren,
      childrenAges,
      workSchedule,
      experience,
      reasonForAdoption,
      emergencyContact,
      references,
    });

    await newApplication.save();

    res.status(201).json({
      message: "Đơn đăng ký nhận nuôi đã được gửi thành công",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error submitting adoption application:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Get user's adoption applications
router.get("/my-applications", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await Adoption.find({ "applicant.user": req.user.id })
      .populate("pet", "name images species breed age gender")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Adoption.countDocuments({
      "applicant.user": req.user.id,
    });

    res.json({
      applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching adoption applications:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Get adoption requests for pet owner
router.get("/requests", auth, async (req, res) => {
  try {
    // Get pets owned by the user
    const userPets = await Pet.find({ owner: req.user.id }).select("_id");
    const petIds = userPets.map((pet) => pet._id);

    if (petIds.length === 0) {
      return res.json({
        applications: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 0,
        },
      });
    }

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || "pending";

    const query = { pet: { $in: petIds } };
    if (status !== "all") {
      query.status = status;
    }

    const applications = await Adoption.find(query)
      .populate("pet", "name images species breed")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Adoption.countDocuments(query);

    res.json({
      applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching adoption requests:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Get adoption application by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const adoptionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ message: "ID đơn nhận nuôi không hợp lệ" });
    }

    const application = await Adoption.findById(adoptionId)
      .populate("pet")
      .populate("applicant.user", "name email phone avatar");

    if (!application) {
      return res.status(404).json({ message: "Không tìm thấy đơn nhận nuôi" });
    }

    // Check if user is authorized to view this application
    const isPetOwner = application.pet.owner.toString() === req.user.id;
    const isApplicant =
      application.applicant.user._id.toString() === req.user.id;

    if (!isPetOwner && !isApplicant && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem đơn nhận nuôi này" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Error fetching adoption application:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Update adoption application status (for pet owners)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const adoptionId = req.params.id;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ message: "ID đơn nhận nuôi không hợp lệ" });
    }

    if (
      !["pending", "approved", "rejected", "completed", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const application = await Adoption.findById(adoptionId).populate("pet");

    if (!application) {
      return res.status(404).json({ message: "Không tìm thấy đơn nhận nuôi" });
    }

    // Check if user is the pet owner
    if (
      application.pet.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật đơn nhận nuôi này" });
    }

    // Update application
    application.status = status;
    if (notes) {
      application.reviewNotes = notes;
    }

    await application.save();

    res.json({
      message: "Cập nhật trạng thái đơn nhận nuôi thành công",
      application,
    });
  } catch (error) {
    console.error("Error updating adoption status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Schedule a meeting (for pet owners)
router.put("/:id/schedule-meeting", auth, async (req, res) => {
  try {
    const adoptionId = req.params.id;
    const { date, location, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ message: "ID đơn nhận nuôi không hợp lệ" });
    }

    if (!date || !location) {
      return res
        .status(400)
        .json({ message: "Ngày và địa điểm gặp mặt là bắt buộc" });
    }

    const application = await Adoption.findById(adoptionId).populate("pet");

    if (!application) {
      return res.status(404).json({ message: "Không tìm thấy đơn nhận nuôi" });
    }

    // Check if user is the pet owner
    if (
      application.pet.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền lên lịch gặp mặt" });
    }

    // Update meeting schedule
    application.meetingSchedule = {
      date: new Date(date),
      location,
      notes: notes || "",
    };

    await application.save();

    res.json({
      message: "Lên lịch gặp mặt thành công",
      application,
    });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cancel adoption application (for applicants)
router.delete("/:id", auth, async (req, res) => {
  try {
    const adoptionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(adoptionId)) {
      return res.status(400).json({ message: "ID đơn nhận nuôi không hợp lệ" });
    }

    const application = await Adoption.findById(adoptionId);

    if (!application) {
      return res.status(404).json({ message: "Không tìm thấy đơn nhận nuôi" });
    }

    // Check if user is the applicant
    if (application.applicant.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy đơn nhận nuôi này" });
    }

    // Check if application can be cancelled
    if (application.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn đang chờ xử lý" });
    }

    // Update status to cancelled
    application.status = "cancelled";
    await application.save();

    res.json({ message: "Hủy đơn nhận nuôi thành công" });
  } catch (error) {
    console.error("Error cancelling adoption application:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
