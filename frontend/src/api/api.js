// frontend/src/api/api.js
import axios from 'axios';

const isDev = import.meta.env.DEV;

// Production: Use full backend URL from env variable
// Development: Use Vite proxy (relative /api)
const API_BASE_URL = isDev 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

const SOCKET_URL = isDev 
  ? 'http://localhost:10000' 
  : (import.meta.env.VITE_SOCKET_URL || 'https://trustracapitaltrade-backend.onrender.com');

console.log(`[API] Environment: ${isDev ? 'DEVELOPMENT (Proxy)' : 'PRODUCTION'}`);
console.log(`[API] Base URL: ${API_BASE_URL}`);

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
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor - Add Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
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
