import axios from 'axios';

/**
 * Trustra Network Gateway
 * Automatically switches between Local Node (10000) and Render Cloud.
 */
const getBaseURL = () => {
  const { hostname, protocol } = window.location;

  // PRODUCTION URLS
  const productionHosts = [
    'trustra-capital-trade.vercel.app',
    'trustracapitaltrade.online',
    'www.trustracapitaltrade.online'
  ];

  if (productionHosts.includes(hostname)) {
    // Corrected to match your actual Render service name
    return 'https://trustracapitaltrade-backend.onrender.com/api';
  }

  // LOCAL DEVELOPMENT (Localhost, 127.0.0.1, or LAN IP 172.20.10.x)
  return `${protocol}//${hostname}:10000/api`;
};

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

// REQUEST INTERCEPTOR: Inject Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Token Persistence & 401 Handling
api.interceptors.response.use(
  (response) => {
    // If the backend sends a fresh token, update storage
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle Session Expiration
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/auth/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('trustra_token');
        // Let AuthContext or ProtectedRoutes handle the redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
