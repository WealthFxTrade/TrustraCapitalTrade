// src/constants/api.js

/**
 * Trustra Capital - Centralized API Configuration
 * Production-ready with fallback safety
 */

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export const API_BASE_URL = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

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
    // PRODUCTION REALIGNMENT FIX: Aligned paths to match updated production route descriptors
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
 * Get API Base URL (production-safe override system)
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return API_BASE_URL;
};

/**
 * Debug helper
 */
export const logApiConfig = () => {
  console.log('Trustra API Config:', {
    baseURL: getApiBaseUrl(),
    socketURL: SOCKET_URL,
    mode: import.meta.env.MODE,
  });
};

