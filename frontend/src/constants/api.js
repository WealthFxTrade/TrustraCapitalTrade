// frontend/src/constants/api.js

export const getApiBaseUrl = () => {
  // 1. Check your defined environment variable first (handles production & local dev smoothly)
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.endsWith('/')
      ? import.meta.env.VITE_API_URL.slice(0, -1)
      : import.meta.env.VITE_API_URL;
    return base;
  }

  // 2. Legacy fallback check in case VITE_API_BASE is ever used
  if (import.meta.env.VITE_API_BASE) {
    const base = import.meta.env.VITE_API_BASE.endsWith('/')
      ? import.meta.env.VITE_API_BASE.slice(0, -1)
      : import.meta.env.VITE_API_BASE;
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  // 3. Fallback if no env files are loaded/found
  if (import.meta.env.DEV) {
    return 'http://localhost:10000/api';
  }
  return '/api';
};

export const getSocketUrl = () => {
  // 1. Trust your .env environment configurations first
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.endsWith('/')
      ? import.meta.env.VITE_SOCKET_URL.slice(0, -1)
      : import.meta.env.VITE_SOCKET_URL;
  }

  // 2. Fallback logic if environment files aren't read yet
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }
  
  const base = getApiBaseUrl();
  return base.replace(/\/api$/, '');
};

export const SOCKET_URL = getSocketUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ESTABLISH_SESSION: '/auth/establish-session',
    AUTHORIZE_SESSION: '/auth/authorize-session',
    VERIFY_SESSION: '/auth/verify-session',
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
