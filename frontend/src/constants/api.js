// frontend/src/constants/api.js

export const getApiBaseUrl = () => {
  // 1. If running on Vercel production/preview, use relative routing to leverage your vercel.json rewrites
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL?.startsWith('http')) {
    return '/api';
  }

  // 2. Respect explicit environment variables if present
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.endsWith('/')
      ? import.meta.env.VITE_API_URL.slice(0, -1)
      : import.meta.env.VITE_API_URL;
    return base;
  }

  // 3. Strict local development fallback matching your backend express config
  if (import.meta.env.DEV) {
    return 'http://localhost:10000/api';
  }

  return '/api';
};

export const getSocketUrl = () => {
  // 1. Prioritize explicitly defined socket environment variables
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.endsWith('/')
      ? import.meta.env.VITE_SOCKET_URL.slice(0, -1)
      : import.meta.env.VITE_SOCKET_URL;
  }

  // 2. WebSockets cannot use server-side rewrites; they must connect directly to the backend
  if (import.meta.env.PROD) {
    return 'https://trustracapitaltrade-backend.onrender.com';
  }

  // 3. Local Development fallback
  return 'http://localhost:10000';
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
