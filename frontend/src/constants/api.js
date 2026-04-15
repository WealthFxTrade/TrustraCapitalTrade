// src/constants/api.js
import axios from 'axios';

/**
 * Trustra Network Gateway Configuration
 * Dynamically resolves the Node URL based on the environment.
 */
const getBaseURL = () => {
  const { hostname, protocol } = window.location;

  // 1. PRODUCTION ASSETS
  // Add all live domains here. If the browser is on these domains, it hits Render.
  const productionHosts = [
    'trustracapitaltrade.online',
    'www.trustracapitaltrade.online',
    'trustra-capital-trade.vercel.app',
    '://trustracapitaltrade-backend.onrender.com'
  ];

  if (productionHosts.includes(hostname)) {
    // Production Cloud Node (Render)
    return 'https://trustracapitaltrade-backend.onrender.com';
  }

  // 2. DEVELOPMENT ASSETS
  // If on localhost, 127.0.0.1, or local network (e.g. 192.168.x.x), it hits local port 10000.
  // This allows you to test on your phone/tablet by using your PC's IP address.
  return `${protocol}//${hostname}:10000/api`;
};

/**
 * Institutional API Endpoints
 * Synchronized with backend routes in userController and authController.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile', 
  },
  USER: {
    STATS: '/users/stats',           // Main dashboard data
    TRANSACTIONS: '/users/ledger',   // Audit history
    COMPOUND: '/users/compound',     // Reinvestment protocol
    WITHDRAW: '/users/withdraw',     // Liquidation
    DEPOSIT_ADDRESS: '/users/deposit-address', 
    PROFILE: '/users/profile',       // Identity update
  },
  ADMIN: {
    USERS: '/admin/users',
    HEALTH: '/admin/health',
    METRICS: '/admin/metrics',
  }
};

/**
 * Axios Instance Configuration
 */
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Crucial for cross-origin session persistence
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR: Bearer Token Injection
 * Attaches the cryptographic identity token to every outgoing secure request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR: Persistence & Session Guardianship
 * Automatically logs users out if the session key is revoked or expired.
 */
api.interceptors.response.use(
  (response) => {
    // Sync fresh tokens from rotation if the backend provides them
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    const { response } = error;

    // 401 Unauthorized Logic (Vault Session Timeout)
    if (response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/auth/reset-password'];
      const currentPath = window.location.pathname;

      // Only force logout if the user is currently in a protected route
      if (!publicPaths.includes(currentPath)) {
        console.warn('Node Identity Revoked. Clearing Local Ledger...');
        localStorage.removeItem('trustra_token');
        
        // Dispatch event for AuthContext to reset state
        window.dispatchEvent(new Event('vault-auth-expired'));

        // Instant fail-safe redirect to prevent dashboard "ghosting"
        if (currentPath.startsWith('/dashboard')) {
          window.location.href = '/login?reason=session_expired';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

