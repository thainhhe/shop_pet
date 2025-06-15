const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// Get all pets
router.get('/', async (req, res) => {
  try {
    const { species, breed, size, city, page = 1, limit = 10 } = req.query;
    const query = {};

    if (species) query.species = species;
    if (breed) query.breed = breed;
    if (size) query.size = size;
    if (city) query['location.city'] = city;

    const pets = await Pet.find(query)
      .populate('owner', 'username shopInfo')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments(query);

    res.json({
      pets,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'username shopInfo');
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new pet
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'shop_owner' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create pets' });
    }

    const petData = JSON.parse(req.body.pet);
    const images = [];

    // Upload images to cloudinary
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        images.push(result.secure_url);
      }
    }

    const pet = new Pet({
      ...petData,
      owner: req.user._id,
      images
    });

    const savedPet = await pet.save();
    res.status(201).json(savedPet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update pet
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    const petData = JSON.parse(req.body.pet);
    const images = [...pet.images];

    // Upload new images
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        images.push(result.secure_url);
      }
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...petData, images },
      { new: true }
    );

    res.json(updatedPet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete pet
router.delete('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    await pet.remove();
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 