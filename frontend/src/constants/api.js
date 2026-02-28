/**
 * src/constants/api.js - Production Synchronized v8.4.1
 * Centralized API endpoints and configuration.
 * All paths are relative — the axios baseURL handles the root /api prefix.
 */

// Base API URL (from .env or fallback)
// IMPORTANT: If your Axios baseURL already includes '/api', ensure these endpoints don't repeat it.
export const API_URL = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api';

// ─────────────────────────────────────────────────────────────────────────────
// Centralized Endpoints (relative paths to the /api root)
// ─────────────────────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // ── Authentication ──
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  },

  // ── User Profile & Dashboard ──
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    TRANSACTIONS: '/user/transactions',
  },

  // ── Wallet & Balances ──
  WALLET: {
    BALANCES: '/wallet/balances',
    GENERATE_ADDRESS: (asset) => `/wallet/generate/${asset}`,
    GET_ADDRESS: (asset) => `/wallet/address/${asset}`,
  },

  // ── Deposits & Withdrawals ──
  DEPOSIT: {
    CREATE: '/deposit/create',
    HISTORY: '/deposit/history',
  },

  WITHDRAWAL: {
    REQUEST: '/withdrawal/request',
    HISTORY: '/withdrawal/history',
  },

  // ── Investments & Plans ──
  INVESTMENT: {
    PLANS: '/investment/plans',
    CREATE: '/investment/create',
    LIST: '/investment/user',
    DETAILS: (id) => `/investment/${id}`,
  },

  // ── KYC ──
  KYC: {
    SUBMIT: '/kyc/submit',
    STATUS: '/kyc/status',
  },

  // ── Admin Endpoints ──
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    KYC_PENDING: '/admin/kyc/pending',
    WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
  },

  // ── Utility / Public ──
  PUBLIC: {
    BTC_PRICE: '/public/bitcoin/price',
    REVIEWS: '/public/reviews',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build full URL from endpoint key or path
 * Corrected to ensure no double slashes and proper string resolution.
 */
export function getApiUrl(endpoint, ...args) {
  let path;

  // 1. Handle function endpoints (e.g. RESET_PASSWORD(token))
  if (typeof endpoint === 'function') {
    path = endpoint(...args);
  } 
  // 2. Handle nested dot notation (e.g. 'AUTH.LOGIN')
  else if (typeof endpoint === 'string' && endpoint.includes('.')) {
    const parts = endpoint.split('.');
    let current = API_ENDPOINTS;
    for (const part of parts) {
      current = current?.[part];
      if (!current) break;
    }
    path = typeof current === 'string' ? current : endpoint;
  } 
  // 3. Fallback to direct string
  else {
    path = endpoint;
  }

  // Sanitize: Remove leading slashes from the path and trailing slashes from API_URL
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanPath = path.toString().replace(/^\/+/, '');

  return `${cleanBase}/${cleanPath}`;
}
