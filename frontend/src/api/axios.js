import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
  withCredentials: true,
  timeout: 15000, // 15s timeout to avoid hanging requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: auto-add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network or CORS error
      console.error("Network error:", error);
      return Promise.reject({ message: "Network error. Please try again." });
    }

    // API returned an error
    const message = error.response.data?.message || "Unexpected API error";
    return Promise.reject({ ...error.response.data, message });
  }
);

export default api;
