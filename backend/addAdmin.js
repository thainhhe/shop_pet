const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function addAdmin() {
  try {
    // Kết nối với MongoDB
    await mongoose.connect("mongodb://localhost:27017/petconnect", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Dữ liệu người dùng admin
    const adminData = {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123", // Thay bằng mật khẩu mong muốn
      role: "admin",
      phone: "1234567890",
      avatar: "",
      isVerified: true,
      premiumSubscription: {
        isActive: false,
        adoptionsRemaining: 0,
      },
    };

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log("User with this email already exists:", adminData.email);
      return;
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    console.log("Hashed password:", adminData.password);

    // Tạo và lưu người dùng
    const admin = new User(adminData);
    await admin.save();
    console.log("Admin user created successfully:", admin.email);

    // Đóng kết nối
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

addAdmin();
