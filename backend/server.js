const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require("./models/User");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
const chatSocketHandler = require("./sockets/chatSocket");
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userName} (${socket.userId})`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle chat events
  chatSocketHandler(io, socket);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userName}`);
  });
});

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/pets", require("./routes/pet.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/adoptions", require("./routes/adoption.routes"));
app.use("/api/shop", require("./routes/shop.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
const chatbotRoutes = require("./routes/chatbot.routes.js");
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/recommendation", require("./routes/recommendation.routes"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
// ⚠️ QUAN TRỌNG: Phải sử dụng server.listen() thay vì app.listen()
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});
