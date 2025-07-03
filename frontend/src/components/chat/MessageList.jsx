"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, currentUser, typingUsers }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug logs
  console.log("MessageList - Messages:", messages);
  console.log("MessageList - Current User:", currentUser);
  console.log(
    "MessageList - Current User ID:",
    currentUser?.id || currentUser?._id
  );

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const currentUserId = currentUser?.id || currentUser?._id;
        const messageSenderId = message.sender?._id || message.sender?.id;
        const isOwn = messageSenderId === currentUserId;
        const showAvatar =
          index === 0 || messages[index - 1].sender._id !== message.sender._id;

        console.log(`Message ${index}:`, {
          messageSenderId,
          currentUserId,
          isOwn,
          content: message.content,
        });

        return (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
          />
        );
      })}

      {Object.keys(typingUsers).length > 0 && (
        <TypingIndicator users={Object.values(typingUsers)} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
