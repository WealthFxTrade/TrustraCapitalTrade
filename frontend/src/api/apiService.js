import axios from 'axios';

/**
 * PRODUCTION-READY AXIOS INSTANCE
 * 1. Uses VITE_API_URL from Vercel environment variables.
 * 2. Adds the mandatory '/api' suffix to match your backend routes.
 * 3. Enables withCredentials for cross-site security.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true, // Crucial for Vercel <-> Render cross-domain communication
  timeout: 30000,        // High timeout to account for Render's "spin-up" delay
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the Bearer token to EVERY outgoing request.
 * This ensures your 'protect' middleware on the backend never sees a missing token.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Standardizes the header key for your authMiddleware.js logic
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles global security events, like session expiration (401).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 (Unauthorized), the token is likely expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we aren't already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

