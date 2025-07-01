const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Pet = require("../models/Pet");
const User = require("../models/User");
const auth = require("../middleware/auth");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Thuật toán matching score
const calculateMatchingScore = (userProfile, pet) => {
  let score = 0;
  let maxScore = 0;

  // Lifestyle matching (30% weight)
  maxScore += 30;
  if (
    userProfile.lifestyle === "active" &&
    pet.personality.includes("energetic")
  )
    score += 30;
  else if (
    userProfile.lifestyle === "quiet" &&
    pet.personality.includes("calm")
  )
    score += 30;
  else if (userProfile.lifestyle === "moderate") score += 20;

  // Living space matching (25% weight)
  maxScore += 25;
  if (userProfile.livingSpace === "apartment" && pet.size === "small")
    score += 25;
  else if (
    userProfile.livingSpace === "house" &&
    ["small", "medium"].includes(pet.size)
  )
    score += 25;
  else if (
    userProfile.livingSpace === "farm" &&
    ["medium", "large", "extra_large"].includes(pet.size)
  )
    score += 25;
  else score += 10;

  // Experience matching (20% weight)
  maxScore += 20;
  if (
    userProfile.experience === "beginner" &&
    pet.personality.includes("friendly")
  )
    score += 20;
  else if (userProfile.experience === "expert") score += 20;
  else score += 15;

  // Preferences matching (25% weight)
  maxScore += 25;
  if (userProfile.preferences.petTypes.includes(pet.species)) score += 15;
  if (userProfile.preferences.sizes.includes(pet.size)) score += 10;

  return Math.round((score / maxScore) * 100);
};

// Get personalized pet recommendations
router.get("/pets", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profile) {
      return res.status(400).json({
        message: "Please complete your profile first to get recommendations",
      });
    }

    // Get available pets
    const pets = await Pet.find({
      status: "available",
      $or: [{ isForAdoption: true }, { isForSale: true }],
    }).populate("owner", "name avatar");

    // Calculate matching scores
    const recommendations = pets.map((pet) => ({
      ...pet.toObject(),
      matchingScore: calculateMatchingScore(user.profile, pet),
      reasons: generateMatchingReasons(user.profile, pet),
    }));

    // Sort by matching score
    recommendations.sort((a, b) => b.matchingScore - a.matchingScore);

    // Get top 10 recommendations
    const topRecommendations = recommendations.slice(0, 10);

    res.json({
      recommendations: topRecommendations,
      userProfile: user.profile,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res
      .status(500)
      .json({ message: "Server error while getting recommendations" });
  }
});

// Generate AI-powered recommendation explanation
router.post("/explain", auth, async (req, res) => {
  try {
    const { petId } = req.body;
    const user = await User.findById(req.user.userId);
    const pet = await Pet.findById(petId).populate("owner", "name");

    if (!user || !pet) {
      return res.status(404).json({ message: "User or pet not found" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Bạn là chuyên gia tư vấn thú cưng. Hãy giải thích tại sao thú cưng này phù hợp với người dùng:

    Thông tin người dùng:
    - Lối sống: ${user.profile.lifestyle}
    - Không gian sống: ${user.profile.livingSpace}
    - Kinh nghiệm: ${user.profile.experience}
    - Sở thích: ${user.profile.preferences.petTypes.join(", ")}

    Thông tin thú cưng:
    - Tên: ${pet.name}
    - Loài: ${pet.species}
    - Giống: ${pet.breed}
    - Kích thước: ${pet.size}
    - Tính cách: ${pet.personality.join(", ")}
    - Tuổi: ${pet.age.value} ${pet.age.unit}

    Hãy viết một đoạn giải thích ngắn gọn (2-3 câu) tại sao thú cưng này phù hợp, tập trung vào những điểm match chính.
    `;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    res.json({ explanation });
  } catch (error) {
    console.error("Generate explanation error:", error);
    res
      .status(500)
      .json({ message: "Server error while generating explanation" });
  }
});

// AI-powered chatbot for pet recommendation
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const user = await User.findById(req.user.userId);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Context về user và hệ thống
    const systemContext = `
    Bạn là AI assistant chuyên về gợi ý thú cưng tại PetConnect. 
    
    Thông tin người dùng hiện tại:
    ${
      user.profile
        ? `
    - Lối sống: ${user.profile.lifestyle}
    - Không gian sống: ${user.profile.livingSpace}  
    - Kinh nghiệm: ${user.profile.experience}
    - Sở thích: ${user.profile.preferences.petTypes.join(", ")}
    `
        : "- Chưa hoàn thành profile"
    }

    Nhiệm vụ của bạn:
    1. Tư vấn về việc chọn thú cưng phù hợp
    2. Giải thích tại sao một thú cưng phù hợp với người dùng
    3. Đưa ra lời khuyên về chăm sóc thú cưng
    4. Hướng dẫn người dùng cập nhật profile để có gợi ý tốt hơn

    Hãy trả lời một cách thân thiện, chuyên nghiệp và hữu ích.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [
            { text: "Tôi hiểu. Tôi sẽ giúp bạn tìm thú cưng phù hợp nhất!" },
          ],
        },
        ...(history || []),
      ],
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error with recommendation chat:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// Helper function to generate matching reasons
const generateMatchingReasons = (userProfile, pet) => {
  const reasons = [];

  if (
    userProfile.lifestyle === "active" &&
    pet.personality.includes("energetic")
  ) {
    reasons.push("Phù hợp với lối sống năng động của bạn");
  }

  if (userProfile.livingSpace === "apartment" && pet.size === "small") {
    reasons.push("Kích thước phù hợp với chung cư");
  }

  if (userProfile.preferences.petTypes.includes(pet.species)) {
    reasons.push("Đúng loại thú cưng bạn yêu thích");
  }

  if (
    userProfile.experience === "beginner" &&
    pet.personality.includes("friendly")
  ) {
    reasons.push("Dễ chăm sóc cho người mới bắt đầu");
  }

  return reasons;
};

module.exports = router;
