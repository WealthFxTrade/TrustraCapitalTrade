/**
 * ── TRUSTRA PROTOCOL CONSTANTS ──
 * Zurich Mainnet v25.3.0
 */

// 1. BASE URL CONFIGURATION
// Matches your Termux backend port
export const API_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:10000' 
    : 'https://trustracapitaltrade-backend.onrender.com';

export const API_PREFIX = ''; 
export const BASE_API_URL = `${API_URL}${API_PREFIX}`;

// 2. SOCKET.IO CONFIGURATION
export const SOCKET_URL = API_URL;

// 3. API ENDPOINTS MAPPING
// These paths must match your backend 'authRoutes.js' exactly.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',             // Used by Login.jsx
    SIGNUP: '/auth/register',          // Used by Signup.jsx -> Hits backend /auth/register
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',          // Used by AuthContext to verify session
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile/update',
    LEDGER: '/user/ledger',
    COMPOUND: '/user/compound-yield'
  },

  INVEST: {
    SUBSCRIBE: '/invest/subscribe',
    ACTIVE_PLANS: '/invest/active',
  },

  ADMIN: {
    DASHBOARD_STATS: '/admin/stats',
    USERS_LIST: '/admin/users',
    UPDATE_BALANCE: '/admin/user/balance',
    WITHDRAWALS: '/admin/withdrawals',
    APPROVE_WITHDRAWAL: '/admin/withdrawal/approve',
    SYSTEM_HEALTH: '/admin/health'
  }
};

/**
 * Helper to build full API URLs safely
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BASE_API_URL}/${cleanEndpoint}`;
};

export default {
  API_URL,
  BASE_API_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getApiUrl
};
