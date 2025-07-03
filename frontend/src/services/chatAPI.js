import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with auth header
const createAuthAxios = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const chatAPI = {
  getChats: () => createAuthAxios().get("/chat"),

  createChat: (data) => createAuthAxios().post("/chat/create", data),

  getMessages: (chatId, page = 1, limit = 50) =>
    createAuthAxios().get(
      `/chat/${chatId}/messages?page=${page}&limit=${limit}`
    ),

  getChatPartners: (type) =>
    createAuthAxios().get(`/chat/partners?type=${type}`),
};
