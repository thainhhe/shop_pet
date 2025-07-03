const { Chat, Message } = require("../models/Chat");
const User = require("../models/User");

module.exports = (io, socket) => {
  // Join a chat room
  socket.on("join_chat", async (data) => {
    try {
      const { chatId } = data;
      const chat = await Chat.findById(chatId).populate(
        "participants",
        "name email role avatar"
      );

      if (
        !chat ||
        !chat.participants.some((p) => p._id.toString() === socket.userId)
      ) {
        socket.emit("error", { message: "Unauthorized to join this chat" });
        return;
      }

      socket.join(`chat_${chatId}`);
      socket.currentChatId = chatId;

      socket.emit("joined_chat", {
        chatId,
        participants: chat.participants,
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to join chat" });
    }
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { chatId, content, messageType = "text", fileUrl = "" } = data;

      console.log("Sending message data:", {
        chatId,
        content,
        messageType,
        fileUrl,
        userId: socket.userId,
      });

      // Verify user is participant in this chat
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(socket.userId)) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      // Create new message - FIX: Add chat field
      const message = new Message({
        sender: socket.userId,
        chat: chatId, // FIX: Add this required field
        content,
        messageType,
        fileUrl,
      });

      await message.save();
      await message.populate("sender", "name avatar role");

      console.log("Message saved:", message);

      // Update chat's last message and activity
      chat.lastMessage = message._id;
      chat.lastActivity = new Date();
      await chat.save();

      // Emit to all participants in the chat
      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message: {
          _id: message._id,
          content: message.content,
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          sender: message.sender,
          createdAt: message.createdAt,
          isRead: message.isRead,
        },
      });

      // Send notification to offline participants
      const offlineParticipants = chat.participants.filter(
        (p) => p.toString() !== socket.userId
      );

      offlineParticipants.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("chat_notification", {
          chatId,
          message: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt,
          },
        });
      });
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Mark messages as read
  socket.on("mark_as_read", async (data) => {
    try {
      const { chatId, messageIds } = data;

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          sender: { $ne: socket.userId },
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      // Notify other participants
      socket.to(`chat_${chatId}`).emit("messages_read", {
        chatId,
        messageIds,
        readBy: socket.userId,
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to mark messages as read" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { chatId, isTyping } = data;
    socket.to(`chat_${chatId}`).emit("user_typing", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping,
    });
  });

  // Leave chat
  socket.on("leave_chat", (data) => {
    const { chatId } = data;
    socket.leave(`chat_${chatId}`);
    socket.currentChatId = null;
  });
};
