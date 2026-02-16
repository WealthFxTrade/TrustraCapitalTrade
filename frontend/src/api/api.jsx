import axios from "axios";

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * 🛠️ SELF-HEALING BASE URL
 * Removes trailing slashes and ensures /api suffix is present.
 */
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
  headers: {
    "Content-Type": "application/json",
  },
});

// 🛡️ REQUEST INTERCEPTOR: Inject Bearer Token
api.interceptors.request.use((config) => {
  const token = accessToken || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 RESPONSE INTERCEPTOR: Handle 401 & Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops on the login/refresh routes themselves
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Use the configured 'api' instance, not the raw 'axios'
        const res = await api.get('/auth/refresh');

        const newToken = res.data.token;
        accessToken = newToken;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh Protocol Failed - Forcing Re-Authentication");
        localStorage.removeItem("token");
        accessToken = null;
        
        // Only redirect if not already on login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

