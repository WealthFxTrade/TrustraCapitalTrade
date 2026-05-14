// src/api/api.js
import axios from 'axios';
import { API_ENDPOINTS, getApiBaseUrl } from '@/constants/api';

const isDev = import.meta.env.DEV;

// Create single production-grade axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // MANDATORY: Transmits secure cookies between Vercel and Render
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ============================================================================
   REQUEST INTERCEPTOR
   ============================================================================ */
api.interceptors.request.use(
  (config) => {
    // Dual fallbacks: Support both localStorage and sessionStorage vectors (Remember Me)
    const token = localStorage.getItem('trustra_token') ||
                 sessionStorage.getItem('trustra_token');

    // Dual-Auth Pattern: Keep the header fallback to support local developer environment sandboxes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================================
   RESPONSE INTERCEPTOR
   ============================================================================ */
api.interceptors.response.use(
  (response) => {
    // Process dual tokens if returned directly from backend payload bodies
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
    // Capture 401 Unauthorized / Session Expiration responses cleanly
    if (error.response?.status === 401) {
      console.warn('Trustra Session validation failed or token expired');

      // Clear structural browser tokens locally
      localStorage.removeItem('trustra_token');
      localStorage.removeItem('trustra_remember');
      sessionStorage.removeItem('trustra_token');

      const currentPath = window.location.pathname;
      
      // PRODUCTION ROUTING FIX: Aligned paths to match updated production route descriptors
      const publicPaths = ['/login', '/register', '/forgotpassword'];

      if (!publicPaths.includes(currentPath)) {
        // Dispatch global alert system event hooks before hard re-routing
        window.dispatchEvent(new CustomEvent('vault-auth-expired'));
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_ENDPOINTS };

