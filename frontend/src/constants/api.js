// src/constants/api.js
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.DEV) return '';
  return import.meta.env.VITE_API_URL || '';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // ✅ CRITICAL: Sends HttpOnly cookies automatically
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ── REQUEST INTERCEPTOR ──
 */
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[Trustra API Request]: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ── RESPONSE INTERCEPTOR ──
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Network Protocol Failure';

    if (import.meta.env.DEV) {
      console.error(`[API Error ${status || 'OFFLINE'}]:`, message);
    }

    // ── 401 SESSION HANDLING ──
    const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
    const currentPath = window.location.pathname;

    // Check if the user is currently on a public page
    const isPublicPath = publicPaths.some(path => 
      path === '/' ? currentPath === '/' : currentPath.startsWith(path)
    );

    // If 401 happens on a PRIVATE page (Dashboard), force redirect to login
    if (status === 401 && !isPublicPath) {
      window.location.replace('/login?expired=true');
    }

    // Always reject the promise so AuthContext.jsx 'catch' block can trigger
    return Promise.reject({
      status: status || 0,
      message: message,
      originalError: error,
    });
  }
);

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  USER: {
    DASHBOARD: '/user/dashboard',
    BALANCES: '/user/balances',
    SYNC: '/user/sync-ledger',
    COMPOUND: '/user/compound',
    TRANSACTIONS: '/user/transactions',
    WITHDRAW: '/user/withdraw',
    UPDATE: '/user/update',
  },
  ADMIN: {
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    APPROVE_WITHDRAWAL: (id) => `/admin/withdrawal/${id}/approve`,
    REJECT_WITHDRAWAL: (id) => `/admin/withdrawal/${id}/reject`,
    DEPOSITS: '/admin/deposits',
    APPROVE_DEPOSIT: (id) => `/admin/deposits/${id}/approve`,
    REJECT_DEPOSIT: (id) => `/admin/deposits/${id}/reject`,
    TRANSACTIONS: '/admin/transactions',
    KYC: '/admin/kyc',
    HEALTH: '/admin/health',
  },
};

export default api;

