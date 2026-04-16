// frontend/src/api/api.js
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:10000';

console.log(`[API] Using Vite Proxy (baseURL = /api)`);
console.log(`[Socket] URL: ${SOCKET_URL}`);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USER: {
    STATS: '/users/stats',
    TRANSACTIONS: '/users/transactions',
    COMPOUND: '/users/compound',
    WITHDRAW: '/users/withdraw',
    DEPOSIT_ADDRESS: '/users/deposit-address',
    PROFILE: '/users/profile',
  },
  ADMIN: {
    USERS: '/admin/users',
    HEALTH: '/admin/health',
  },
};

const api = axios.create({
  baseURL: '/api',                    // ← This is the key (proxied)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token & logout on 401
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trustra_token');
    }
    return Promise.reject(error);
  }
);

export default api;
export { SOCKET_URL };
