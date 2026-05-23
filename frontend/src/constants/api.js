// src/constants/api.js

/**
 * Removes trailing slashes and trims spaces
 */
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/+$/, '').trim();
};

/**
 * Detect environment
 */
const IS_DEV = import.meta.env.MODE === 'development';

/**
 * Get Backend API Base URL with priority:
 * 1. VITE_API_URL (env)
 * 2. Development fallback
 * 3. Production fallback
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }

  if (IS_DEV) {
    return 'http://localhost:10000/api';
  }

  // Production
  return 'https://trustracapitaltrade-backend.onrender.com/api';
};

/**
 * Get Socket Server URL
 */
export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return normalizeUrl(import.meta.env.VITE_SOCKET_URL);
  }

  if (IS_DEV) {
    return 'http://localhost:10000';
  }

  return 'https://trustracapitaltrade-backend.onrender.com';
};

/**
 * Resolved URLs
 */
export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();

/**
 * API ENDPOINTS (Keep in sync with backend routes)
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',                    // legacy fallback
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

  HEALTH: '/health',   // Root health check
};

/**
 * Default Export
 */
const apiConfig = {
  IS_DEV,
  getApiBaseUrl,
  getSocketUrl,
  API_BASE_URL,
  SOCKET_URL,
  API_ENDPOINTS,
};

export default apiConfig;
