// src/constants/api.js

/**
 * Removes trailing slashes and trims spaces
 */
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.replace(/\/+$/, '').trim();
};

/**
 * Detect development environment
 */
const IS_DEV = import.meta.env.MODE === 'development';

/**
 * BACKEND API BASE URL
 */
export const getApiBaseUrl = () => {
  /**
   * Use environment variable if provided
   */
  if (import.meta.env.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }

  /**
   * Development fallback
   */
  if (IS_DEV) {
    return 'http://localhost:10000/api';
  }

  /**
   * Production fallback
   */
  return 'https://trustracapitaltrade-backend.onrender.com/api';
};

/**
 * SOCKET SERVER URL
 */
export const getSocketUrl = () => {
  /**
   * Use environment variable if provided
   */
  if (import.meta.env.VITE_SOCKET_URL) {
    return normalizeUrl(import.meta.env.VITE_SOCKET_URL);
  }

  /**
   * Development fallback
   */
  if (IS_DEV) {
    return 'http://localhost:10000';
  }

  /**
   * Production fallback
   */
  return 'https://trustracapitaltrade-backend.onrender.com';
};

/**
 * RESOLVED URL CONSTANTS
 * These are the actual exported constants
 * used throughout the frontend
 */
export const API_BASE_URL = getApiBaseUrl();

export const SOCKET_URL = getSocketUrl();

/**
 * API ENDPOINTS
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
    RESEND_VERIFICATION: '/auth/resend-verification',
    AUTHORIZE_SESSION: '/auth/authorize-session',
    ESTABLISH_SESSION: '/auth/establish-session',
    VERIFY_SESSION: '/auth/verify-session',
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
};

/**
 * DEFAULT EXPORT
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
