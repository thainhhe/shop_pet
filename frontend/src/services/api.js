import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

// Pets API
export const petsAPI = {
  getPets: (params) => api.get("/pets", { params }),
  getPet: (id) => api.get(`/pets/${id}`),
  createPet: (petData) => api.post("/pets", petData),
  createPetWithImages: (formData) =>
    api.post("/pets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePet: (id, petData) => api.put(`/pets/${id}`, petData),
  updatePetWithImages: (id, formData) =>
    api.put(`/pets/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePet: (id) => api.delete(`/pets/${id}`),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post("/products", productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (itemId, quantity, itemType) =>
    api.post("/cart/add", { itemId, quantity, itemType }),
  updateCartItem: (itemId, quantity) =>
    api.put(`/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clearCart: () => api.delete("/cart/clear"),
  removeSelected: (selectedItems) =>
    api.post("/cart/removeSelected", { selectedItems }),
};

// Order API
export const orderAPI = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post("/orders/create", orderData),
  cancelOrder: (id, cancelReason) =>
    api.put(`/orders/cancel/${id}`, { cancelReason }),
  updatePaymentStatus: (id, paymentStatus) =>
    api.put(`/orders/update-payment/${id}`, { paymentStatus }),
};

// Adoption API
export const adoptionAPI = {
  submitApplication: (petId, applicationData) =>
    api.post(`/adoptions/apply/${petId}`, applicationData),
  getMyApplications: (params) =>
    api.get("/adoptions/my-applications", { params }),
  getAdoptionRequests: (params) => api.get("/adoptions/requests", { params }),
  getAdoptionById: (id) => api.get(`/adoptions/${id}`),
  updateAdoptionStatus: (id, status, notes) =>
    api.put(`/adoptions/${id}/status`, { status, notes }),
  scheduleMeeting: (id, date, location) =>
    api.put(`/adoptions/${id}/schedule-meeting`, { date, location }),
  cancelApplication: (id) => api.delete(`/adoptions/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteImage: (publicId) => api.delete(`/upload/delete/${publicId}`),
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Order Management
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getStats: () => api.get("/admin/stats"),
};

export default api;
