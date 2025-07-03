"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { chatAPI } from "../services/api";

const ChatContext = createContext();

const initialState = {
  socket: null,
  chats: [],
  currentChat: null,
  messages: {},
  onlineUsers: new Set(),
  typingUsers: {},
  unreadCounts: {},
  loading: false,
  error: null,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case "SET_SOCKET":
      return { ...state, socket: action.payload };

    case "SET_CHATS":
      return { ...state, chats: action.payload, loading: false };

    case "SET_CURRENT_CHAT":
      return { ...state, currentChat: action.payload };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages,
        },
      };

    case "ADD_MESSAGE":
      const { chatId, message } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message],
        },
      };

    case "UPDATE_CHAT_LAST_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat._id === action.payload.chatId
            ? {
                ...chat,
                lastMessage: action.payload.message,
                lastActivity: new Date(),
              }
            : chat
        ),
      };

    case "SET_TYPING":
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.chatId]: action.payload.isTyping
            ? {
                ...state.typingUsers[action.payload.chatId],
                [action.payload.userId]: action.payload.userName,
              }
            : Object.fromEntries(
                Object.entries(
                  state.typingUsers[action.payload.chatId] || {}
                ).filter(([id]) => id !== action.payload.userId)
              ),
        },
      };

    case "INCREMENT_UNREAD":
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.chatId]:
            (state.unreadCounts[action.payload.chatId] || 0) + 1,
        },
      };

    case "CLEAR_UNREAD":
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.chatId]: 0,
        },
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token && !state.socket) {
      // Sử dụng import.meta.env thay vì process.env
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      const socket = io(serverUrl, {
        auth: { token },
      });

      socket.on("connect", () => {
        console.log("Connected to chat server");
        dispatch({ type: "SET_SOCKET", payload: socket });
      });

      socket.on("new_message", (data) => {
        dispatch({ type: "ADD_MESSAGE", payload: data });
        dispatch({ type: "UPDATE_CHAT_LAST_MESSAGE", payload: data });

        // Increment unread count if not in current chat
        if (state.currentChat?._id !== data.chatId) {
          dispatch({
            type: "INCREMENT_UNREAD",
            payload: { chatId: data.chatId },
          });
        }
      });

      socket.on("user_typing", (data) => {
        dispatch({ type: "SET_TYPING", payload: data });
      });

      socket.on("chat_notification", (data) => {
        // Handle push notifications here
        console.log("New chat notification:", data);
      });

      socket.on("error", (error) => {
        dispatch({ type: "SET_ERROR", payload: error.message });
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to connect to chat server",
        });
      });

      return () => {
        socket.disconnect();
        dispatch({ type: "SET_SOCKET", payload: null });
      };
    }
  }, [isAuthenticated, token]);

  // Load user's chats
  const loadChats = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await chatAPI.getChats();
      dispatch({ type: "SET_CHATS", payload: response.data.chats });
    } catch (error) {
      console.error("Load chats error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load chats" });
    }
  };

  // Create or get chat
  const createChat = async (
    participantId,
    chatType,
    relatedPet,
    relatedProduct
  ) => {
    try {
      const response = await chatAPI.createChat({
        participantId,
        chatType,
        relatedPet,
        relatedProduct,
      });

      // Add to chats if new
      const existingChat = state.chats.find(
        (c) => c._id === response.data.chat._id
      );
      if (!existingChat) {
        dispatch({
          type: "SET_CHATS",
          payload: [response.data.chat, ...state.chats],
        });
      }

      return response.data.chat;
    } catch (error) {
      console.error("Create chat error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to create chat" });
      throw error;
    }
  };

  // Join chat
  const joinChat = (chat) => {
    if (state.socket && chat) {
      state.socket.emit("join_chat", { chatId: chat._id });
      dispatch({ type: "SET_CURRENT_CHAT", payload: chat });
      dispatch({ type: "CLEAR_UNREAD", payload: { chatId: chat._id } });
    }
  };

  // Send message
  const sendMessage = (content, messageType = "text", fileUrl = "") => {
    if (state.socket && state.currentChat) {
      state.socket.emit("send_message", {
        chatId: state.currentChat._id,
        content,
        messageType,
        fileUrl,
      });
    }
  };

  // Send typing indicator
  const sendTyping = (isTyping) => {
    if (state.socket && state.currentChat) {
      state.socket.emit("typing", {
        chatId: state.currentChat._id,
        isTyping,
      });
    }
  };

  // Load messages for a chat
  const loadMessages = async (chatId) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      dispatch({
        type: "SET_MESSAGES",
        payload: { chatId, messages: response.data.messages },
      });
    } catch (error) {
      console.error("Load messages error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load messages" });
    }
  };

  const value = {
    ...state,
    loadChats,
    createChat,
    joinChat,
    sendMessage,
    sendTyping,
    loadMessages,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
