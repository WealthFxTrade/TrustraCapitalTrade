import axios from 'axios';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
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
  withCredentials: true,  // Required for cookies
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(config => {
  if (import.meta.env.DEV) console.log(`🚀 [API]: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for automatic 401 redirect
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 401 && !window.location.pathname.includes('/login')) {
      window.location.replace('/login?expired=true');
    }
    return Promise.reject(err);
  }
);

export default api;
