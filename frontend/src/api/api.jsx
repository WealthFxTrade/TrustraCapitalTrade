import axios from "axios";
import { toast } from "react-hot-toast";

// ── Axios instance ──
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
  withCredentials: true, // needed for cookie-based refresh tokens
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── In-memory token store ──
let accessToken = null;

// Function to set the token from AuthContext
export const setAccessToken = (token) => {
  accessToken = token;
};

// ── Request interceptor: auto-add access token ──
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint (assumes secure HTTP-only cookie)
        const res = await axios.get(`${api.defaults.baseURL}/auth/refresh`, {
          withCredentials: true,
        });

        // Update access token and retry original request
        accessToken = res.data.token;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Network error
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject({ message: "Network error. Please try again." });
    }

    // API returned an error
    const message = error.response.data?.message || "Unexpected API error";
    return Promise.reject({ ...error.response.data, message });
  }
);

export default api;
