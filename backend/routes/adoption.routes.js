const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Adoption = require("../models/Adoption");
const Pet = require("../models/Pet");
const User = require("../models/User");
const Otp = require("../models/Otp");

// Hàm tạo mã OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Nộp đơn nhận nuôi
router.post("/apply/:petId", auth, async (req, res) => {
  try {
    const petId = req.params.petId;

    // 1. Validate ID thú cưng
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "ID thú cưng không hợp lệ" });
    }

    // 2. Tìm thú cưng có trạng thái 'available'
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Không tìm thấy thú cưng" });
    }
    if (pet.status !== "available") {
      return res
        .status(400)
        .json({ message: "Thú cưng này không có sẵn để nhận nuôi" });
    }

    // 3. Kiểm tra xem người dùng đã có đơn chờ/duyệt cho thú cưng này chưa
    const existApp = await Adoption.findOne({
      pet: petId,
      "applicant.user": req.user.userId,
      status: { $in: ["pending", "approved"] },
    });
    if (existApp) {
      return res.status(400).json({
        message:
          "Bạn đã có đơn nhận nuôi đang chờ xử lý hoặc đã được duyệt với thú cưng này.",
      });
    }

    // 4. Lấy thông tin người dùng từ DB
    const user = await User.findById(req.user.userId).select(
      "name email phone"
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy thông tin người dùng." });
    }

    // 5. Lấy dữ liệu từ form
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

    // 6. Validate dữ liệu form
    if (
      !livingArrangement ||
      !workSchedule ||
      !experience ||
      !reasonForAdoption ||
      !emergencyContact ||
      !emergencyContact.name ||
      !emergencyContact.phone ||
      !emergencyContact.relationship ||
      !references ||
      !Array.isArray(references) ||
      references.length === 0 ||
      !references[0].name ||
      !references[0].phone ||
      !references[0].relationship
    ) {
      return res.status(400).json({
        message:
          "Vui lòng điền đầy đủ thông tin: điều kiện sống, lịch làm việc, kinh nghiệm, lý do nhận nuôi, liên hệ khẩn cấp, và người tham khảo.",
      });
    }

    // 7. Tạo đơn nhận nuôi mới
    const newApp = new Adoption({
      pet: petId,
      applicant: {
        user: req.user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
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
      status: "pending",
      createdAt: new Date(),
    });

    await newApp.save();

    return res.status(201).json({
      message: "Đơn nhận nuôi đã được gửi thành công.",
      application: newApp,
    });
  } catch (error) {
    console.error("❌ Lỗi khi gửi đơn nhận nuôi:", error);
    return res.status(500).json({
      message: "Lỗi server khi gửi đơn nhận nuôi.",
      error: error.message,
    });
  }
});

// Lấy danh sách đơn nhận nuôi của người dùng
router.get("/my-applications", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await Adoption.find({
      "applicant.user": req.user.userId,
    })
      .populate("pet", "name images species breed age gender")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Adoption.countDocuments({
      "applicant.user": req.user.userId,
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

// Lấy danh sách yêu cầu nhận nuôi cho chủ sở hữu thú cưng
router.get("/requests", auth, async (req, res) => {
  try {
    // Lấy danh sách thú cưng của người dùng
    const userPets = await Pet.find({ owner: req.user.userId }).select("_id");
    const petIds = userPets.map((pet) => pet._id);

    if (petIds.length === 0) {
      return res.json({
        applications: [],
        pagination: { total: 0, page: 1, pages: 0 },
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

// Lấy thông tin chi tiết một đơn nhận nuôi bằng ID
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

    // Kiểm tra quyền xem đơn
    const isPetOwner = application.pet.owner.toString() === req.user.userId;
    const isApplicant =
      application.applicant.user._id.toString() === req.user.userId;

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

// Cập nhật trạng thái đơn (dành cho chủ thú cưng/admin)
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

    // Kiểm tra quyền cập nhật
    if (
      application.pet.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật đơn nhận nuôi này" });
    }

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

// Lên lịch gặp mặt (dành cho chủ thú cưng/admin)
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

    // Kiểm tra quyền
    if (
      application.pet.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền lên lịch gặp mặt" });
    }

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

// Hủy đơn nhận nuôi (dành cho người nộp đơn)
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

    // Kiểm tra quyền hủy đơn
    if (application.applicant.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy đơn nhận nuôi này" });
    }

    if (application.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn đang chờ xử lý" });
    }

    application.status = "cancelled";
    await application.save();

    res.json({ message: "Hủy đơn nhận nuôi thành công" });
  } catch (error) {
    console.error("Error cancelling adoption application:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Gửi mã OTP
router.post("/send-otp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.phone) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy số điện thoại người dùng." });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await Otp.findOneAndUpdate(
      { userId: req.user.userId },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`📤 OTP gửi đến ${user.phone}: ${otpCode}`);
    // 🔐 Tích hợp với dịch vụ SMS gateway thật ở đây

    res.json({ message: "OTP đã được gửi về điện thoại." });
  } catch (err) {
    console.error("Lỗi gửi OTP:", err);
    res.status(500).json({ message: "Lỗi gửi OTP" });
  }
});

// Xác minh mã OTP
router.post("/verify-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    const record = await Otp.findOne({ userId });

    if (!record)
      return res.status(400).json({ message: "Bạn chưa yêu cầu mã OTP" });
    if (record.otp !== otp)
      return res.status(400).json({ message: "Mã OTP không đúng" });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });

    await Otp.deleteOne({ userId }); // Xoá mã OTP đã dùng

    res.json({ message: "Xác minh OTP thành công" });
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    res.status(500).json({ message: "Lỗi server khi xác minh OTP" });
  }
});

module.exports = router;
