/**
 * ── TRUSTRA API PROTOCOL ──
 * Zurich Mainnet v25.3.0
 * Configuration for Backend Synchronization
 */

// 1. BASE URL CONFIGURATION
// In development (Termux/local), use backend port 10000
// In production, use the Render deployment URL
export const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:10000'   // local backend
    : 'https://trustracapitaltrade-backend.onrender.com';  // production backend

/**
 * CRITICAL PROTOCOL ALIGNMENT:
 * Your server.js mounts routes at app.use('/api', authRoutes)
 * So all endpoints must start with /api/...
 */
export const API_PREFIX = '/api';

// The final base URL (e.g. http://127.0.0.1:10000/api)
export const BASE_API_URL = `\( {API_URL} \){API_PREFIX}`;

// 2. REAL-TIME PROTOCOL (SOCKET.IO)
// WebSockets connect to the root URL (no /api prefix needed)
export const SOCKET_URL = API_URL;

/**
 * 3. API ENDPOINTS MAPPING
 * These paths are appended to BASE_API_URL
 * Example: AUTH.LOGIN → /api/auth/login
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SIGNUP: '/auth/register',        // alias for compatibility
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  USER: {
    PROFILE: '/user/profile',
    LEDGER: '/user/ledger',
    COMPOUND: '/user/compound-yield',
    UPDATE_PROFILE: '/user/update',
  },

  INVEST: {
    PLANS: '/invest/plans',
    SUBSCRIBE: '/invest/subscribe',
    MY_ASSETS: '/invest/my-assets',
  },

  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    TRANSACTIONS: '/admin/ledger',
    UPDATE_USER: '/admin/user/update',
  },
};

/**
 * 4. UTILITY: getApiUrl
 * Helper to build full URLs for non-Axios calls (fetch, etc.)
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `\( {BASE_API_URL}/ \){cleanEndpoint}`;
};

// Default export for easy importing
export default {
  API_URL,
  API_PREFIX,
  BASE_API_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getApiUrl,
};
