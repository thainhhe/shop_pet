const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

let storage;

// Use Cloudinary in production, otherwise use local disk storage
if (process.env.NODE_ENV === "production") {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "petconnect",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    },
  });
} else {
  // Configure local disk storage for development
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = { upload, cloudinary };
