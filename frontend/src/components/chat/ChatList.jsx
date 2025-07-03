"use client";

import { useEffect, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { formatDistanceToNow } from "date-fns";
import NewChatModal from "./NewChatModal";

export default function ChatList({ onSelectChat }) {
  const { user } = useAuth();
  const { chats, loadChats, unreadCounts } = useChat();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Fix: Get correct user ID
  const currentUserId = user?.id || user?._id || user?.userId;

  useEffect(() => {
    loadChats();
  }, []);

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";
    if (message.messageType === "image") return "📷 Image";
    if (message.messageType === "file") return "📎 File";
    return message.content.length > 50
      ? message.content.substring(0, 50) + "..."
      : message.content;
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find((p) => p._id !== currentUserId);
  };

  const handleChatCreated = (newChat) => {
    // Reload chats to include the new one
    loadChats();
    // Select the new chat
    onSelectChat(newChat);
  };

  return (
    <>
      <Card className="w-80 h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" onClick={() => setShowNewChatModal(true)}>
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm">
                Start a new chat to connect with shop owners or rescue centers
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const unreadCount = unreadCounts[chat._id] || 0;

                return (
                  <div
                    key={chat._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSelectChat(chat)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={
                            otherParticipant?.avatar ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={otherParticipant?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {otherParticipant?.name}
                          </h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(chat.lastActivity),
                                { addSuffix: true }
                              )}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {formatLastMessage(chat.lastMessage)}
                          </p>
                          <div className="flex items-center space-x-1">
                            {chat.chatType === "user_shop" && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Shop
                              </span>
                            )}
                            {chat.chatType === "user_rescue" && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Rescue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </>
  );
}
