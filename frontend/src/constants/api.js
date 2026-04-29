// src/constants/api.js
import axios from 'axios';

/**
 * Trustra Network Gateway Configuration
 * Dynamically resolves the Node URL based on the environment.
 */
const getBaseURL = () => {
  const { hostname, protocol } = window.location;

  // 1️⃣ PRODUCTION HOSTS
  const productionHosts = [
    'trustracapitaltrade.online',
    'www.trustracapitaltrade.online',
    'trustra-capital-trade.vercel.app'
  ];

  if (productionHosts.includes(hostname)) {
    return 'https://onrender.com';
  }

  // 2️⃣ DEVELOPMENT HOSTS
  return `${protocol}//${hostname}:10000/api`;
};

/**
 * Institutional API Endpoints
 * Stay synchronized with backend routes.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  USER: {
    STATS: '/users/stats',
    TRANSACTIONS: '/users/ledger',
    COMPOUND: '/users/compound',
    WITHDRAW: '/users/withdraw',
    DEPOSIT_ADDRESS: '/users/deposit-address',
    PROFILE: '/users/profile',
  },
  ADMIN: {
    // Stats & System Oversight
    OVERVIEW: '/admin/overview',
    HEALTH: '/admin/health',
    METRICS: '/admin/metrics',

    // User Management & Ledger Overrides
    USERS: '/admin/users',
    GET_USER_DETAIL: (id) => `/admin/users/${id}`,
    UPDATE_USER_BALANCE: (id) => `/admin/users/${id}/balances`,
    UPDATE_USER_VERIFY: (id) => `/admin/users/${id}/verify`,

    // KYC / Compliance Engine
    KYC_PENDING: '/admin/kyc/pending',
    KYC_UPDATE: '/admin/kyc/update',

    // Deposit Liquidity Management
    DEPOSITS_PENDING: '/admin/deposits/pending',
    UPDATE_DEPOSIT_STATUS: (id) => `/admin/deposits/${id}/status`,

    // Withdrawal / Redemption Protocol
    WITHDRAWALS: '/admin/withdrawals/pending',
    APPROVE_WITHDRAWAL: (id) => `/admin/withdrawals/${id}/approve`,
    REJECT_WITHDRAWAL: (id) => `/admin/withdrawals/${id}/reject`,
  }
};

/**
 * Axios Instance
 */
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Attaches Bearer token to secure requests
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
 * RESPONSE INTERCEPTOR
 * Handles token refresh, session expiry, and auto-logout
 */
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/auth/reset-password'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        console.warn('Vault Session Revoked. Clearing access nodes...');
        localStorage.removeItem('trustra_token');
        
        window.dispatchEvent(new Event('vault-auth-expired'));

        if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin')) {
          window.location.href = '/login?reason=session_expired';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

