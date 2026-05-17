// src/constants/api.js

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.replace(/\/+$/, '');
};

const IS_DEV = import.meta.env.MODE === 'development';

/**
 * ============================================
 * BACKEND BASE URL
 * ============================================
 * Development:
 *   Uses Vite proxy through "/api"
 *
 * Production:
 *   Uses deployed backend URL
 * ============================================
 */
export const getApiBaseUrl = () => {
  // Explicit environment override
  if (import.meta.env.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }

  // Development → use Vite proxy
  if (IS_DEV) {
    return '/api';
  }

  // Production backend
  return 'https://trustracapitaltrade-backend.onrender.com/api';
};

/**
 * ============================================
 * API BASE URL
 * ============================================
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * ============================================
 * SOCKET URL
 * ============================================
 */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  ? normalizeUrl(import.meta.env.VITE_SOCKET_URL)
  : (
      IS_DEV
        ? 'http://localhost:10000'
        : 'https://trustracapitaltrade-backend.onrender.com'
    );

/**
 * ============================================
 * API ENDPOINTS
 * ============================================
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

    GET_USER_DETAIL: (id) => `/admin/users/${id}`,

    UPDATE_USER_BALANCE: (id) =>
      `/admin/users/${id}/balances`,

    UPDATE_USER_VERIFY: (id) =>
      `/admin/users/${id}/verify`,

    KYC_PENDING: '/admin/kyc/pending',

    KYC_UPDATE: (id) =>
      `/admin/kyc/${id}`,

    DEPOSITS_PENDING: '/admin/deposits/pending',

    UPDATE_DEPOSIT_STATUS: (id) =>
      `/admin/deposits/${id}/status`,

    WITHDRAWALS_PENDING:
      '/admin/withdrawals/pending',

    APPROVE_WITHDRAWAL: (id) =>
      `/admin/withdrawals/${id}/approve`,

    REJECT_WITHDRAWAL: (id) =>
      `/admin/withdrawals/${id}/reject`,
  },

  PUBLIC: {
    MARKET_DATA: '/public/market-data',
    PRICES: '/public/prices',
  },
};

/**
 * ============================================
 * DEFAULT EXPORT
 * ============================================
 */
export default {
  API_BASE_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getApiBaseUrl,
};
