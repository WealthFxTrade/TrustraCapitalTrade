// frontend/src/constants/api.js

export const getApiBaseUrl = () => {
  // Point directly to Render in production to bypass Vercel rewrite issues
  if (import.meta.env.PROD) {
    return 'https://trustracapitaltrade-backend.onrender.com/api';
  }

  // Respect explicit environment variables if present in dev
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.endsWith('/')
      ? import.meta.env.VITE_API_URL.slice(0, -1)
      : import.meta.env.VITE_API_URL;
  }

  // Strict local development fallback
  return 'http://localhost:10000/api';
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.endsWith('/')
      ? import.meta.env.VITE_SOCKET_URL.slice(0, -1)
      : import.meta.env.VITE_SOCKET_URL;
  }
  return 'https://trustracapitaltrade-backend.onrender.com';
};

export const SOCKET_URL = getSocketUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    // FIX: Remapped to point to your standard login endpoint
    ESTABLISH_SESSION: '/auth/login', 
    AUTHORIZE_SESSION: '/auth/login',
    VERIFY_SESSION: '/auth/profile', 
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
  },

  USER: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    TRANSACTIONS: '/users/ledger',
    COMPOUND: '/users/compound',
    WITHDRAW: '/users/withdraw',
    DEPOSIT_ADDRESS: '/users/deposit-address',
    BALANCE: '/users/balance',
  },

  ADMIN: {
    OVERVIEW: '/admin/overview',
    HEALTH: '/admin/health',
    METRICS: '/admin/metrics',
    USERS: '/admin/users',
    KYC_PENDING: '/admin/kyc/pending',
    DEPOSITS_PENDING: '/admin/deposits/pending',
    WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
  },

  PUBLIC: {
    MARKET_DATA: '/public/market-data',
    PRICES: '/public/prices',
  },

  HEALTH: '/health',
};
