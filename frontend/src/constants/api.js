/**
 * src/constants/api.js - Production v8.4.2
 * Synchronized with backend route mounting.
 */

// Toggle between Vite proxy (local) and Production Render URL
export const API_URL = import.meta.env.MODE === 'development' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },
  // User Management
  USER: {
    PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    SETTINGS: '/user/settings',
  },
  // Asset Management
  WALLET: {
    BALANCES: '/wallet/balances',
    ADDRESS: (asset) => `/wallet/address/${asset}`,
    HISTORY: '/wallet/transactions',
  },
  // Administrative Operations
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    KYC_PENDING: '/admin/kyc/pending',
    WITHDRAWALS: '/admin/withdrawals/pending',
    AUDIT_LOGS: '/admin/audit-logs',
  },
};

/**
 * Builds a sanitized, full URL for Axios calls.
 * Ensures consistent pathing regardless of leading/trailing slashes.
 */
export function getApiUrl(endpoint, ...args) {
  let path = typeof endpoint === 'function' ? endpoint(...args) : endpoint;
  
  // Sanitize: Remove trailing slash from base and leading slash from path
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanPath = path.toString().replace(/^\/+/, '');
  
  return `${cleanBase}/${cleanPath}`;
}
