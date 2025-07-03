// frontend/src/components/chatbot/Chatbot.jsx

import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/api";
import "./Chatbot.css"; // Sẽ tạo file CSS này ngay sau đây

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: "Chào bạn! Tôi có thể giúp gì cho bạn về việc tìm thú cưng hoặc các sản phẩm tại PetConnect?",
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatboxRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Chuẩn bị history cho API
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts.map((part) => ({ text: part.text })),
      }));

      const data = await sendChatMessage(input, history);
      const botMessage = { role: "model", parts: [{ text: data.reply }] };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "model",
        parts: [{ text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header" onClick={toggleChat}>
          PetConnect AI Assistant
          <span className="close-btn">{isOpen ? "—" : "＋"}</span>
        </div>
        {isOpen && (
          <>
            <div className="chatbot-box" ref={chatboxRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.role === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  <p>{msg.parts[0].text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message bot-message">
                  <p className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </p>
                </div>
              )}
            </div>
            <form className="chatbot-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                Gửi
              </button>
            </form>
          </>
        )}
      </div>
      {!isOpen && (
        <div className="chat-icon" onClick={toggleChat}>
          💬
        </div>
      )}
    </>
  );
};

export default Chatbot;
