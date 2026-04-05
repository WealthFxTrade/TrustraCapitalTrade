import axios from 'axios';

const getBaseURL = () => {
  const { hostname, protocol } = window.location;

  // Production URLs
  if (
    hostname === 'trustra-capital-trade.vercel.app' ||
    hostname === 'trustracapitaltrade.online' ||
    hostname === 'www.trustracapitaltrade.online'
  ) {
    return 'https://trustra-capital-trade-backend.onrender.com/api';
  }

  // Local Development
  return `${protocol}//${hostname}:10000/api`;
};

// THIS IS THE MISSING EXPORT CAUSING YOUR ERROR
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
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for Token Management
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/auth/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('trustra_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
