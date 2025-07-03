const express = require("express");
const { Chat, Message } = require("../models/Chat");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's chats
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId,
      isActive: true,
    })
      .populate("participants", "name email role avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .populate("relatedPet", "name images")
      .populate("relatedProduct", "name images")
      .sort({ lastActivity: -1 });

    res.json({ chats });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// Create or get existing chat
router.post("/create", auth, async (req, res) => {
  try {
    const { participantId, chatType, relatedPet, relatedProduct } = req.body;

    // Validate participant exists and has correct role
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Validate chat type matches participant role
    if (
      (chatType === "user_shop" && participant.role !== "shop_owner") ||
      (chatType === "user_rescue" && participant.role !== "rescue_center")
    ) {
      return res
        .status(400)
        .json({ message: "Invalid chat type for participant role" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.userId, participantId] },
      chatType,
      isActive: true,
    })
      .populate("participants", "name email role avatar")
      .populate("relatedPet", "name images")
      .populate("relatedProduct", "name images");

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user.userId, participantId],
        chatType,
        relatedPet,
        relatedProduct,
      });

      await chat.save();
      await chat.populate("participants", "name email role avatar");
      await chat.populate("relatedPet", "name images");
      await chat.populate("relatedProduct", "name images");
    }

    res.json({ chat });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
});

// Get chat messages - FIX: Query messages by chatId
router.get("/:chatId/messages", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log("Getting messages for chat:", chatId);

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // FIX: Query messages by chat field, not all messages
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tạo
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log("Found messages for chat", chatId, ":", messages.length);

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Get available chat partners (shop owners and rescue centers)
router.get("/partners", auth, async (req, res) => {
  try {
    const { type } = req.query; // 'shop' or 'rescue'

    const roleFilter = {};
    if (type === "shop") {
      roleFilter.role = "shop_owner";
    } else if (type === "rescue") {
      roleFilter.role = "rescue_center";
    } else {
      roleFilter.role = { $in: ["shop_owner", "rescue_center"] };
    }

    const partners = await User.find(roleFilter)
      .select("name email role avatar address")
      .limit(20);

    res.json({ partners });
  } catch (error) {
    console.error("Get partners error:", error);
    res.status(500).json({ message: "Failed to fetch chat partners" });
  }
});

module.exports = router;
