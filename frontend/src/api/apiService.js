// src/api/apiService.js
import axios from 'axios';

// ────────────────────────────────────────────────
// Base URL logic – safe, clean, and configurable
// ────────────────────────────────────────────────
const getBaseURL = () => {
  // Priority: environment variable → fallback
  let base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';

  // Normalize: remove trailing slash, ensure /api is present
  base = base.replace(/\/+$/, ''); // remove trailing slashes
  return base.endsWith('/api') ? base : `${base}/api`;
};

// ────────────────────────────────────────────────
// Axios instance creation
// ────────────────────────────────────────────────
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,           // important if using cookies/sessions
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ────────────────────────────────────────────────
// Request Interceptor – Attach Bearer Token
// ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: log requests in development
    if (import.meta.env.DEV) {
      console.debug(`[API Request] \( {config.method?.toUpperCase()} \){config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ────────────────────────────────────────────────
// Response Interceptor – Global error normalization
// ────────────────────────────────────────────────
api.interceptors.response.use(
  // Success: just pass through
  (response) => response,

  // Error handling
  (error) => {
    // Handle 401 – token expired / unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      // Optional: clear more if needed (user, role, etc.)
      // localStorage.clear(); ← only if you want full reset

      // Redirect only if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        const redirectUrl = `/login?reason=expired&from=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }

      // Don't reject further – already handled redirect
      return Promise.reject({ message: 'Session expired. Please log in again.', status: 401 });
    }

    // Normalize error shape for consistent handling in components
    const normalizedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Something went wrong. Please try again.',
      status: error.response?.status || 500,
      success: false,
      data: error.response?.data || null,
    };

    // Optional: log in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
