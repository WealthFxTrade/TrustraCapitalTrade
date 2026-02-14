import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  // Fallback ensures it works even if ENV variables fail in Vercel
  baseURL: import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com/api",
  withCredentials: true,
  timeout: 30000, 
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  const token = accessToken || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${api.defaults.baseURL}/auth/refresh`, { withCredentials: true });
        accessToken = res.data.token;
        localStorage.setItem("token", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
