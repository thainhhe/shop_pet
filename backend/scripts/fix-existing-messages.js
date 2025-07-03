const mongoose = require("mongoose");
const { Chat, Message } = require("../models/Chat");
require("dotenv").config();

async function fixExistingMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find messages without chat field
    const messagesWithoutChat = await Message.find({
      chat: { $exists: false },
    });
    console.log(
      `Found ${messagesWithoutChat.length} messages without chat field`
    );

    // For each message, try to find the chat it belongs to
    for (const message of messagesWithoutChat) {
      // Find chat that contains this message in lastMessage
      const chat = await Chat.findOne({ lastMessage: message._id });

      if (chat) {
        message.chat = chat._id;
        await message.save();
        console.log(`Fixed message ${message._id} -> chat ${chat._id}`);
      } else {
        console.log(`Could not find chat for message ${message._id}`);
        // You might want to delete orphaned messages
        // await message.deleteOne()
      }
    }

    console.log("Finished fixing messages");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixExistingMessages();
