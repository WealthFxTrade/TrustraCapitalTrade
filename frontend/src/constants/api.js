// src/constants/api.js

/**
 * Trustra Capital - Centralized API Endpoints
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
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
 * Get API Base URL with proper environment priority
 */
export const getApiBaseUrl = () => {
  // Highest priority: Environment variable (from .env files)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:10000/api';
  }

  // Production fallback (proxy or relative path)
  return '/api';
};

/** Debug helper */
export const logApiConfig = () => {
  console.log('[Trustra API Config]', {
    mode: import.meta.env.MODE,
    baseURL: getApiBaseUrl(),
    viteApiUrl: import.meta.env.VITE_API_URL || 'Not set',
  });
};
