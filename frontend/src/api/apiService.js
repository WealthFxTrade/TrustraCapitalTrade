import axios from 'axios';

/**
 * TRUSTRA CAPITAL TRADE - Base API Service
 * Centralized Axios instance for all backend communication.
 */
const api = axios.create({
  // Ensure the /api suffix matches your backend route structure
  baseURL: 'https://trustracapitaltrade-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the JWT token to every request if it exists.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
 * Handles global errors like 401 (Unauthorized) to force a logout.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is expired or invalid, clear storage and boot to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * EXPORTS
 * We provide both to prevent "No matching export" errors in Vite/Termux.
 */
export { api };         // Named export for: import { api } from ...
export default api;    // Default export for: import api from ...

