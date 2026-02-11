import axios from 'axios';

/**
 * Trustra Capital Trade - Centralized API Service
 * Version: 8.4.1 (2026 Directive)
 */

const getBaseURL = () => {
  let base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';
  // Remove any trailing slashes to prevent // in the URL
  base = base.replace(/\/+$/, '');
  // Ensure the URL ends with /api but don't double it
  return base.endsWith('/api') ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Inject Bearer Token
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

// 2. Response Interceptor: Global Error & Session Management
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Expired Session)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=expired';
      }
    }

    // Normalize error message for the Frontend Toast notifications
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Node Synchronization Failure';

    return Promise.reject({ ...error, message: errorMessage });
  }
);

/**
 * Service Exports for Dashboard & Profile
 */
export const getProfile = () => api.get('/user/me');
export const getDashboard = () => api.get('/user/dashboard');
export const getBalances = () => api.get('/user/balance');

export default api;

