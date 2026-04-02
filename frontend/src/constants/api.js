import axios from 'axios';

// ── ENDPOINT MAP ──
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USER: {
    BALANCES: '/auth/profile', // Re-routing to profile to get balance object
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

// ── AXIOS INSTANCE ──
const api = axios.create({
  // Dynamically uses VITE_API_URL (http://172.20.10.3:10000/api)
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api',
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ── INTERCEPTORS ──
api.interceptors.request.use(config => {
  if (import.meta.env.DEV) console.log(`🚀 [API]: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

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
