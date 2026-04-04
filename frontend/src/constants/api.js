// src/constants/api.js
import axios from 'axios';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    BALANCES: '/auth/profile',
    STATS: '/user/stats',
    HISTORY: '/user/transactions',
    COMPOUND: '/user/compound',
  },
  ADMIN: {
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    HEALTH: '/admin/health',
  }
};

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 [API ${config.method.toUpperCase()}]: ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ [API Response]: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(`❌ [API Error]: ${error.config?.url}`, error.response?.data || error.message);
    }

    const status = error.response?.status;

    // Redirect to login on 401 (except for auth routes)
    if (status === 401) {
      const isAuthRoute = window.location.pathname.includes('/auth') || 
                          window.location.pathname.includes('/login');
      if (!isAuthRoute) {
        window.location.replace('/auth/login?session=expired');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
