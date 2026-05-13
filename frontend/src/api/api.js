// src/api/api.js
import axios from 'axios';
import { API_ENDPOINTS, getApiBaseUrl } from '@/constants/api';

const isDev = import.meta.env.DEV;

// Create single axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ==================== REQUEST INTERCEPTOR ==================== */
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

/* ==================== RESPONSE INTERCEPTOR ==================== */
api.interceptors.response.use(
  (response) => {
    // Save new token only if returned from auth endpoints
    if (response.data?.token) {
      const rememberMe = localStorage.getItem('trustra_remember') === 'true';
      
      if (rememberMe) {
        localStorage.setItem('trustra_token', response.data.token);
      } else {
        sessionStorage.setItem('trustra_token', response.data.token);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized');

      // Clear all tokens
      localStorage.removeItem('trustra_token');
      localStorage.removeItem('trustra_remember');
      sessionStorage.removeItem('trustra_token');

      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/forgot-password'];

      if (!publicPaths.includes(currentPath)) {
        window.dispatchEvent(new CustomEvent('vault-auth-expired'));
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_ENDPOINTS };
