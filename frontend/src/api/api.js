// src/api/api.js
import axios from 'axios';

// ────────────────────────────────────────────────
// Base URL – safe & configurable
// ────────────────────────────────────────────────
const getBaseURL = () => {
  let base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';

  // Normalize: remove trailing slash, ensure /api is present
  base = base.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

// ────────────────────────────────────────────────
// Axios instance creation
// ────────────────────────────────────────────────
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false, // change to true only if backend uses cookies/sessions
});

// ────────────────────────────────────────────────
// Request interceptor – attach token
// ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional dev logging
    if (import.meta.env.DEV) {
      console.debug(`[API →] \( {config.method?.toUpperCase()} \){config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ────────────────────────────────────────────────
// Response interceptor – basic error handling
// ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Handle 401 (token expired / unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?reason=expired&from=${encodeURIComponent(currentPath)}`;
      }
    }

    // Normalize error shape
    const normalizedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Request failed. Please try again.',
      status: error.response?.status || 500,
      success: false,
      data: error.response?.data || null,
    };

    if (import.meta.env.DEV) {
      console.error('[API ERROR]', normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

// Export as default (so you can do import api from '../api')
export default api;
