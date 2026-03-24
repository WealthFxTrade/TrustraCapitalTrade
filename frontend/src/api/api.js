import axios from 'axios';
import { BASE_API_URL } from '../constants/api';

/**
 * TRUSTRA CAPITAL API INSTANCE
 * Configured with the Render URL from constants/api.js
 */
const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  withCredentials: true, // Necessary for cross-origin session/cookie support
});

// Attach JWT token to every request from LocalStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FIXED: Cleaned up the template literal for logging in Termux/Browser
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.url} | Token: ${!!token}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles 401 Unauthorized globally by purging local session
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.error('[API] 401 Unauthorized - Purging token from registry');
      localStorage.removeItem('token');
      
      // Prevent infinite redirect loops if already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

