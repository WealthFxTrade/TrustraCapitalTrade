// src/api/api.js
import axios from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/constants/api';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,        // Important for cookies + credentials
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =============================================
   REQUEST INTERCEPTOR
   ============================================= */
api.interceptors.request.use(
  (config) => {
    // Support both localStorage and sessionStorage (Remember Me)
    const token = localStorage.getItem('trustra_token') ||
                  sessionStorage.getItem('trustra_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =============================================
   RESPONSE INTERCEPTOR
   ============================================= */
api.interceptors.response.use(
  (response) => {
    // Auto-save new token if backend returns one
    if (response.data?.token) {
      const isRememberMe = localStorage.getItem('trustra_remember') === 'true';

      if (isRememberMe) {
        localStorage.setItem('trustra_token', response.data.token);
      } else {
        sessionStorage.setItem('trustra_token', response.data.token);
      }
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Handle Token Expiration / Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn('🔐 Auth token expired or invalid');

      // Clear all tokens
      localStorage.removeItem('trustra_token');
      localStorage.removeItem('trustra_remember');
      sessionStorage.removeItem('trustra_token');

      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/apply', '/forgotpassword'];

      if (!publicPaths.includes(currentPath)) {
        window.dispatchEvent(new CustomEvent('auth-expired'));
        window.location.href = '/login?reason=session_expired';
      }
    }

    return Promise.reject(error);
  }
);

/* =============================================
   Helper Functions
   ============================================= */
export const setAuthToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('trustra_token', token);
    localStorage.setItem('trustra_remember', 'true');
  } else {
    sessionStorage.setItem('trustra_token', token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('trustra_token');
  localStorage.removeItem('trustra_remember');
  sessionStorage.removeItem('trustra_token');
};

export const isAuthenticated = () => {
  return !!(localStorage.getItem('trustra_token') || sessionStorage.getItem('trustra_token'));
};

export default api;
export { API_ENDPOINTS };
