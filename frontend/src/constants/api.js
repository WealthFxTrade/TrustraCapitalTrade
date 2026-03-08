/**
 * ── TRUSTRA API PROTOCOL ──
 * Zurich Mainnet v25.3.0
 * Configuration for Backend Synchronization
 */

// 1. BASE URL CONFIGURATION
// In Termux development, we use port 10000. In production, we hit the Render cloud.
export const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:10000'
    : 'https://trustracapitaltrade-backend.onrender.com';

/**
 * 🚨 CRITICAL PROTOCOL ALIGNMENT:
 * Your server.js mounts routes at app.use('/api/...').
 * Therefore, API_PREFIX must be '/api' so that all calls 
 * reach the correct backend controllers.
 */
export const API_PREFIX = '/api';

// The final gateway URL (e.g., http://localhost:10000/api)
export const BASE_API_URL = `${API_URL}${API_PREFIX}`;

// 2. REAL-TIME PROTOCOL (SOCKET.IO)
// WebSockets usually connect to the root URL without the /api prefix
export const SOCKET_URL = API_URL;

/**
 * 3. API ENDPOINTS MAPPING
 * These paths are appended to BASE_API_URL.
 * * Example: AUTH.SIGNUP results in: 
 * [BASE_API_URL] + [/auth/register] 
 * => http://localhost:10000/api/auth/register
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',       // Matches backend router.post('/register')
    SIGNUP: '/auth/register',         // Alias to prevent import errors in Signup.jsx
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',         // Used by AuthContext to verify JWT
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  USER: {
    PROFILE: '/user/profile',         // Fetch account balances & metadata
    LEDGER: '/user/ledger',           // Fetch transaction history
    COMPOUND: '/user/compound-yield', // Trigger manual compounding if enabled
    UPDATE_PROFILE: '/user/update',   // Change name or contact info
  },

  INVEST: {
    PLANS: '/invest/plans',           // Fetch active Rio plans
    SUBSCRIBE: '/invest/subscribe',   // Join a new investment tier
    MY_ASSETS: '/invest/my-assets',   // View personal portfolio stats
  },

  ADMIN: {
    USERS: '/admin/users',            // Get list of all registered nodes
    STATS: '/admin/stats',            // System-wide TVL and profit stats
    TRANSACTIONS: '/admin/ledger',    // Global financial oversight
    UPDATE_USER: '/admin/user/update' // Manual balance adjustments
  }
};

/**
 * 4. UTILITY: getApiUrl
 * A safe helper to build full URLs for non-Axios fetch calls if needed.
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BASE_API_URL}/${cleanEndpoint}`;
};

// Default export for standardized importing
export default {
  API_URL,
  API_PREFIX,
  BASE_API_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getApiUrl
};
