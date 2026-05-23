// src/constants/api.js

/* =========================
   URL NORMALIZER
========================= */
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/+$/, '').trim();
};

/* =========================
   ENVIRONMENT
========================= */
const IS_DEV = import.meta.env.MODE === 'development';

/* =========================
   BASE API URL
========================= */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  if (IS_DEV) {
    return 'http://localhost:10000/api';
  }

  return 'https://trustracapitaltrade-backend.onrender.com/api';
};

/* =========================
   SOCKET URL
========================= */
export const getSocketUrl = () => {
  const envSocket = import.meta.env.VITE_SOCKET_URL;

  if (envSocket) {
    return normalizeUrl(envSocket);
  }

  if (IS_DEV) {
    return 'http://localhost:10000';
  }

  return 'https://trustracapitaltrade-backend.onrender.com';
};

/* =========================
   FINAL RESOLVED VALUES
========================= */
export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();

/* =========================
   API ENDPOINTS
========================= */
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
    USERS: '/admin/users',
    OVERVIEW: '/admin/overview',
    METRICS: '/admin/metrics',
  },

  PUBLIC: {
    PRICES: '/public/prices',
  },

  HEALTH: '/health',
};

/* =========================
   DEFAULT EXPORT
========================= */
const apiConfig = {
  IS_DEV,
  API_BASE_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getApiBaseUrl,
  getSocketUrl,
};

export default apiConfig;
