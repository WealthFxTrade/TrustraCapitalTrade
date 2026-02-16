import axios from "axios";

let accessToken = localStorage.getItem("token") || null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const BASE_URL = (
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://trustracapitaltrade-backend.onrender.com"
).endsWith("/api")
  ? (import.meta.env.VITE_API_URL?.replace(/\/$/, ""))
  : (import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://trustracapitaltrade-backend.onrender.com") + "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.get('/auth/refresh');
        const newToken = res.data.token;
        accessToken = newToken;
        localStorage.setItem("token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // SESSION DEAD: Clear everything
        localStorage.removeItem("token");
        accessToken = null;
        
        // Prevent redirect loop if already on login
        if (!window.location.pathname.includes("/login")) {
           window.location.href = "/login?session=expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

