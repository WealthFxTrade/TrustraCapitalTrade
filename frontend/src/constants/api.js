// src/constants/api.js
import axios from 'axios';

/**
 * Trustra Network Gateway Configuration
 * Dynamically resolves the Node URL based on the environment.
 */
const getBaseURL = () => {
  const { hostname, protocol } = window.location;

  // 1️⃣ PRODUCTION HOSTS
  // Add all live domains here. If the browser is on these domains, it hits the production backend.
  const productionHosts = [
    'trustracapitaltrade.online',
    'www.trustracapitaltrade.online',
    'trustra-capital-trade.vercel.app'
  ];

  if (productionHosts.includes(hostname)) {
    // Explicit production backend API URL
    return 'https://trustracapitaltrade-backend.onrender.com/api';
  }

  // 2️⃣ DEVELOPMENT HOSTS
  // If on localhost, 127.0.0.1, or local network, hit the local backend port
  return `${protocol}//${hostname}:10000/api`;
};

/**
 * Institutional API Endpoints
 * Must stay synchronized with backend routes.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USER: {
    STATS: '/users/stats',           // Dashboard stats
    TRANSACTIONS: '/users/ledger',   // Ledger / transaction history
    COMPOUND: '/users/compound',     // Reinvestment protocol
    WITHDRAW: '/users/withdraw',     // Withdrawals
    DEPOSIT_ADDRESS: '/users/deposit-address', // Deposit address
    PROFILE: '/users/profile',       // Profile update
  },
  ADMIN: {
    USERS: '/admin/users',
    HEALTH: '/admin/health',
    METRICS: '/admin/metrics',
  }
};

/**
 * Axios Instance
 */
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Important for cross-origin session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Attaches Bearer token to secure requests
 */
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

/**
 * RESPONSE INTERCEPTOR
 * Handles token refresh, session expiry, and auto-logout
 */
api.interceptors.response.use(
  (response) => {
    // Sync fresh token if provided by backend
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    const { response } = error;

    // 401 Unauthorized → Session expired / token revoked
    if (response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/auth/reset-password'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        console.warn('Session expired. Clearing local token...');
        localStorage.removeItem('trustra_token');

        // Dispatch custom event for AuthContext or global state
        window.dispatchEvent(new Event('vault-auth-expired'));

        // Redirect to login if user is on dashboard or protected route
        if (currentPath.startsWith('/dashboard')) {
          window.location.href = '/login?reason=session_expired';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
