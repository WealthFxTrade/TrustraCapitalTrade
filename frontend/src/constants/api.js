/**
 * ── TRUSTRA CAPITAL TRADE: API PROTOCOL ──
 * Version: 25.3.0 | Zurich Mainnet
 */

// Determine Authority based on Environment
export const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://172.20.10.2:10000'; // Your Termux Network IP

export const API_PREFIX = '/api';
export const BASE_API_URL = `${API_URL}${API_PREFIX}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile/update',
    LEDGER: '/users/ledger',
  },
  ADMIN: {
    HEALTH: '/admin/health',
    USERS: '/admin/users',
    UPDATE_USER_PLAN: (id) => `/admin/users/${id}/plan`,
    UPDATE_USER_BALANCE: (id) => `/admin/users/${id}/balance`,
    WITHDRAWALS: '/admin/withdrawals',
    PROCESS_WITHDRAWAL: (id) => `/admin/withdrawal/${id}`,
    LEDGER: '/admin/ledger',
    TRIGGER_ROI: '/admin/trigger-roi',
  }
};

/**
 * Helper to build full URL strings for legacy fetch calls if needed
 */
export const getApiUrl = (endpoint) => {
  const cleanPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BASE_API_URL}/${cleanPath}`;
};

export default { API_URL, BASE_API_URL, API_ENDPOINTS };

