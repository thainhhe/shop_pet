"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import { Card } from "../ui/Card";

export default function ChatWindow() {
  const { user } = useAuth();
  const {
    currentChat,
    messages,
    typingUsers,
    joinChat,
    loadMessages,
    sendMessage,
    sendTyping,
    error,
  } = useChat();

  const [selectedChat, setSelectedChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const typingTimeoutRef = useRef(null);

  // Fix: Ensure we get the correct user ID
  const currentUserId = user?.id || user?._id || user?.userId;

  useEffect(() => {
    console.log("User object:", user);
    console.log("Current User ID:", currentUserId);
  }, [user, currentUserId]);

  useEffect(() => {
    if (selectedChat) {
      console.log("Selected chat:", selectedChat);
      joinChat(selectedChat);
      loadMessages(selectedChat._id);

      // Debug info
      setDebugInfo({
        chatId: selectedChat._id,
        participants: selectedChat.participants,
        messagesInState: messages[selectedChat._id] || [],
        currentUserId: currentUserId,
      });
    }
  }, [selectedChat, currentUserId]);

  // Debug messages when they change
  useEffect(() => {
    if (selectedChat) {
      const chatMessages = messages[selectedChat._id] || [];
      console.log("Messages for chat", selectedChat._id, ":", chatMessages);
      console.log("Current user ID for comparison:", currentUserId);

      setDebugInfo((prev) => ({
        ...prev,
        messagesInState: chatMessages,
        messagesCount: chatMessages.length,
        currentUserId: currentUserId,
      }));
    }
  }, [messages, selectedChat, currentUserId]);

  const handleSelectChat = (chat) => {
    console.log("Selecting chat:", chat);
    setSelectedChat(chat);
  };

  const handleSendMessage = (content, messageType, fileUrl) => {
    console.log("Sending message:", { content, messageType, fileUrl });
    sendMessage(content, messageType, fileUrl);
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      sendTyping(typing);

      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          sendTyping(false);
        }, 3000);
      }
    }
  };

  const otherParticipant = selectedChat?.participants.find(
    (p) => p._id !== currentUserId
  );
  const chatMessages = selectedChat ? messages[selectedChat._id] || [] : [];
  const currentTypingUsers = selectedChat
    ? typingUsers[selectedChat._id] || {}
    : {};

  // Create a proper current user object for MessageList
  const currentUserForMessages = {
    id: currentUserId,
    _id: currentUserId,
    ...user,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat List Sidebar */}
        <ChatList onSelectChat={handleSelectChat} />

        {/* Chat Window */}
        {selectedChat ? (
          <Card className="flex-1 flex flex-col h-full">
            <ChatHeader participant={otherParticipant} chat={selectedChat} />

            {/* Debug Info - Remove this after fixing */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-yellow-100 p-2 text-xs">
                <strong>Debug Info:</strong>
                <div>Chat ID: {debugInfo.chatId}</div>
                <div>Messages Count: {debugInfo.messagesCount || 0}</div>
                <div>
                  Current User ID: {debugInfo.currentUserId || "MISSING!"}
                </div>
                <div>Error: {error || "None"}</div>
                <div>
                  User Object Keys:{" "}
                  {user ? Object.keys(user).join(", ") : "No user"}
                </div>
              </div>
            )}

            <MessageList
              messages={chatMessages}
              currentUser={currentUserForMessages}
              typingUsers={currentTypingUsers}
            />

            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2">
                Select a chat to start messaging
              </h3>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
