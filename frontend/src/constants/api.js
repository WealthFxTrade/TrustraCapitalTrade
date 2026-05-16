// src/constants/api.js
/**
 * Trustra Capital - Centralized API Configuration
 * Production-ready with environment-based fallbacks
 */

const getBackendBase = () => {
  // Priority 1: Environment variable (Recommended)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash if present
  }

  // Priority 2: Production fallback
  return 'https://trustracapitaltrade-backend.onrender.com/api';
};

/** Main API Configuration */
export const API_BASE_URL = getBackendBase();
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
                         'https://trustracapitaltrade-backend.onrender.com';

/**
 * API Endpoints
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
    UPDATE_USER_BALANCE: (id) => `/admin/users/${id}/balances`,
    UPDATE_USER_VERIFY: (id) => `/admin/users/${id}/verify`,

    KYC_PENDING: '/admin/kyc/pending',
    KYC_UPDATE: (id) => `/admin/kyc/${id}`,

    DEPOSITS_PENDING: '/admin/deposits/pending',
    UPDATE_DEPOSIT_STATUS: (id) => `/admin/deposits/${id}/status`,

    WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
    APPROVE_WITHDRAWAL: (id) => `/admin/withdrawals/${id}/approve`,
    REJECT_WITHDRAWAL: (id) => `/admin/withdrawals/${id}/reject`,
  },

  PUBLIC: {
    MARKET_DATA: '/public/market-data',
    PRICES: '/public/prices',
  },
};

/**
 * Get current API Base URL (used by axios instance)
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Debug helper - Call this in development to verify config
 */
export const logApiConfig = () => {
  console.group('🔧 Trustra API Configuration');
  console.log('Mode          :', import.meta.env.MODE);
  console.log('API Base URL  :', API_BASE_URL);
  console.log('Socket URL    :', SOCKET_URL);
  console.log('VITE_API_URL  :', import.meta.env.VITE_API_URL || 'Not set (using fallback)');
  console.groupEnd();
};

// Auto-log in development
if (import.meta.env.DEV) {
  logApiConfig();
}
