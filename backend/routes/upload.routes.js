const express = require("express");
const { upload, cloudinary } = require("../middleware/upload");
const auth = require("../middleware/auth");

const router = express.Router();

// Upload single image
router.post("/single", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    res.json({
      message: "Image uploaded successfully",
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Upload single image error:", error);
    res.status(500).json({ message: "Server error while uploading image" });
  }
});

// Upload multiple images
router.post("/multiple", auth, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    console.error("Upload multiple images error:", error);
    res.status(500).json({ message: "Server error while uploading images" });
  }
});

// Delete image
router.delete("/delete/:publicId", auth, async (req, res) => {
  try {
    const { publicId } = req.params;

    await cloudinary.uploader.destroy(publicId);

    res.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Server error while deleting image" });
  }
});

module.exports = router;
