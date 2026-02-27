// src/constants/api.js
/**
 * Centralized API endpoints and configuration
 * All paths are relative — axios baseURL handles the root
 * Use API_ENDPOINTS in api.js calls for consistency and easy maintenance
 */

// Base API URL (from .env or fallback)
export const API_URL = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api';

// ──────────────────────────────────────────────
// Centralized Endpoints (relative paths)
// ──────────────────────────────────────────────
export const API_ENDPOINTS = {
  // ── Authentication ────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  },

  // ── User Profile & Dashboard ─────────────────────────────
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    TRANSACTIONS: '/user/transactions', // alias for /transactions/my
  },

  // ── Wallet & Balances ────────────────────────────────────
  WALLET: {
    BALANCES: '/wallet/balances',
    GENERATE_ADDRESS: (asset) => `/wallet/generate/${asset}`,
    GET_ADDRESS: (asset) => `/wallet/address/${asset}`,
  },

  // ── Deposits & Withdrawals ───────────────────────────────
  DEPOSIT: {
    CREATE: '/deposit/create',
    HISTORY: '/deposit/history',
  },

  WITHDRAWAL: {
    REQUEST: '/withdrawal/request',
    HISTORY: '/withdrawal/history',
  },

  // ── Investments & Plans ──────────────────────────────────
  INVESTMENT: {
    PLANS: '/investment/plans',
    CREATE: '/investment/create',
    LIST: '/investment/user',
    DETAILS: (id) => `/investment/${id}`,
  },

  // ── KYC ──────────────────────────────────────────────────
  KYC: {
    SUBMIT: '/kyc/submit',
    STATUS: '/kyc/status',
  },

  // ── Admin Endpoints ──────────────────────────────────────
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    KYC_PENDING: '/admin/kyc/pending',
    WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
  },

  // ── Utility / Public ─────────────────────────────────────
  PUBLIC: {
    BTC_PRICE: '/public/bitcoin/price',
    REVIEWS: '/public/reviews',
  },
};

// ──────────────────────────────────────────────
// Helper Functions (optional but useful)
// ──────────────────────────────────────────────

/**
 * Build full URL from endpoint key or path
 * @param {string|function} endpoint - Key from API_ENDPOINTS or direct path
 * @param {...any} args - Arguments if endpoint is a function
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint, ...args) {
  let path;

  // Handle function endpoints (e.g. RESET_PASSWORD(token))
  if (typeof endpoint === 'function') {
    path = endpoint(...args);
  } else if (typeof endpoint === 'string') {
    // Try to resolve from nested structure
    const parts = endpoint.split('.');
    let current = API_ENDPOINTS;

    for (const part of parts) {
      current = current[part];
      if (!current) break;
    }

    path = typeof current === 'string' ? current : endpoint;
  } else {
    path = endpoint;
  }

  // Clean path (no double slashes)
  const cleanPath = path.replace(/^\/+|\/+$/g, '');

  return `\( {API_URL}/ \){cleanPath}`;
}

// Example usage:
// getApiUrl(API_ENDPOINTS.AUTH.LOGIN) → /api/auth/login
// getApiUrl(API_ENDPOINTS.RESET_PASSWORD, 'abc123') → /api/auth/reset-password/abc123
