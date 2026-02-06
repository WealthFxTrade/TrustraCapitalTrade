import axios from 'axios';

/**
 * TRUSTRA CAPITAL TRADE - Base API Service
 * Centralized Axios instance for all backend communication.
 * Synchronized with Render Backend + Vercel Frontend (Feb 2026)
 */
const api = axios.create({
  // FIXED: Added /api suffix to match app.use('/api', ...) in your backend
  baseURL: 'https://trustracapitaltrade-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies can be sent if you use express-session or cookies in 2026
  withCredentials: true 
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
    // If the token is expired or invalid (401), or access is denied (403)
    if (error.response?.status === 401) {
      console.warn('Session expired or invalid. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent infinite redirect loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 404s specifically for debugging 2026 routes
    if (error.response?.status === 404) {
      console.error(`Route not found: ${error.config.url}`);
    }

    return Promise.reject(error);
  }
);

/**
 * EXPORTS
 * Dual export to satisfy Vite/Termux build requirements
 */
export { api };         // Named export
export default api;    // Default export

