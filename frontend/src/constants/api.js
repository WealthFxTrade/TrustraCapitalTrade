// frontend/src/constants/api.js

export const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://trustracapitaltrade-backend.onrender.com/api';
  }

  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.endsWith('/')
      ? import.meta.env.VITE_API_URL.slice(0, -1)
      : import.meta.env.VITE_API_URL;
    return base;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:10000/api';
  }

  return '/api';
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.endsWith('/')
      ? import.meta.env.VITE_SOCKET_URL.slice(0, -1)
      : import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.PROD) {
    return 'https://trustracapitaltrade-backend.onrender.com';
  }

  return 'http://localhost:10000';
};

export const SOCKET_URL = getSocketUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    // LOCKED TO EXACT ENDPOINT:
    ESTABLISH_SESSION: '/auth/establish-session',
    AUTHORIZE_SESSION: '/auth/establish-session',
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
