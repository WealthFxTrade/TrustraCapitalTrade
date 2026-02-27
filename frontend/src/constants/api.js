// src/constants/api.js - Production Synchronized v8.4.1
/**
 * Centralized API endpoints and configuration
 * All paths are relative — axios baseURL handles the root
 */

// Base API URL (from .env or fallback)
export const API_URL = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api';

// ──────────────────────────────────────────────
// Centralized Endpoints (relative paths)
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────

/**
 * Build full URL from endpoint key or path
 * Corrected Template Literal Syntax
 */
export function getApiUrl(endpoint, ...args) {
  let path;

  // Handle function endpoints (e.g. RESET_PASSWORD(token))
  if (typeof endpoint === 'function') {
    path = endpoint(...args);
  } else if (typeof endpoint === 'string') {
    // Try to resolve nested string from dots (e.g. 'AUTH.LOGIN')
    const parts = endpoint.split('.');
    let current = API_ENDPOINTS;

    for (const part of parts) {
      current = current?.[part];
      if (!current) break;
    }

    path = typeof current === 'string' ? current : endpoint;
  } else {
    path = endpoint;
  }

  // Ensure path is clean (remove leading slashes as API_URL provides them if needed)
  const cleanPath = path.replace(/^\/+/, '');

  // FIX: Proper Template Literal backticks
  return `${API_URL}/${cleanPath}`;
}

