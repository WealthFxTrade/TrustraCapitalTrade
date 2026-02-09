import axios from "axios";

const api = axios.create({
  // Remove /api from baseURL
  baseURL: import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: "Network error. Try again." });
    }
    return Promise.reject({
      ...error.response.data,
      message: error.response.data?.message || "API error",
    });
  }
);

export default api;
