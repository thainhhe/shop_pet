// backend/routes/chatbot.routes.js

const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Google Generative AI với API key từ file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body; // Nhận tin nhắn và lịch sử trò chuyện từ frontend

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Bắt đầu cuộc trò chuyện với lịch sử có sẵn
    const chat = model.startChat({
      history: history || [], // Nếu không có history thì dùng mảng rỗng
      generationConfig: {
        maxOutputTokens: 250, // Giới hạn token trả về
      },
    });

    // Gửi tin nhắn mới và chờ phản hồi
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

module.exports = router;
