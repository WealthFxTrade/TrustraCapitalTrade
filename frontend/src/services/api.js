import axios from 'axios';

// Get the API URL from environment variables
// Vercel uses import.meta.env for Vite projects
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // CRITICAL: This allows the browser to send/receive secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor (Optional: for attaching Bearer tokens if not using cookies)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the server says we aren't logged in, clear local storage
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

