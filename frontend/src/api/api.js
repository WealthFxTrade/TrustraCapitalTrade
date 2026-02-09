import axios from "axios";

const api = axios.create({
  // Prefixing with /api is standard for Express backends
  baseURL: `${import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com"}/api`,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Use 'token' as the universal key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

