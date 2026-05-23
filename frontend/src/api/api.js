// src/api/api.js

import axios from 'axios';
import { getApiBaseUrl } from '@/constants/api';

/* =========================
   STORAGE KEYS
========================= */
const TOKEN_KEY = 'trustra_token';
const REMEMBER_KEY = 'trustra_remember';

/* =========================
   API CONFIG
========================= */
const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ESTABLISH_SESSION: '/auth/establish-session',
    AUTHORIZE_SESSION: '/auth/authorize-session',
    VERIFY_SESSION: '/auth/verify-session',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
  },

  USER: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    TRANSACTIONS: '/users/ledger',
    COMPOUND: '/users/compound',
    WITHDRAW: '/users/withdraw',
    DEPOSIT_ADDRESS: '/users/deposit-address',
    BALANCE: '/users/balance',
  },

  ADMIN: {
    OVERVIEW: '/admin/overview',
    HEALTH: '/admin/health',
    METRICS: '/admin/metrics',
    USERS: '/admin/users',
    KYC_PENDING: '/admin/kyc/pending',
    DEPOSITS_PENDING: '/admin/deposits/pending',
    WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
  },

  PUBLIC: {
    MARKET_DATA: '/public/market-data',
    PRICES: '/public/prices',
  },

  HEALTH: '/health',
};

/* =========================
   AXIOS INSTANCE
========================= */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* =========================
   TOKEN HELPERS
========================= */
const getToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
};

export const setAuthToken = (token, remember = false) => {
  if (!token) return;

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_KEY, 'true');
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => !!getToken();

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(
        `🚀 ${config.method?.toUpperCase()} ${config.url}`,
        config.data || ''
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    const newToken = response?.data?.token || response?.data?.accessToken;

    if (newToken) {
      const remember = localStorage.getItem(REMEMBER_KEY) === 'true';

      if (remember) {
        localStorage.setItem(TOKEN_KEY, newToken);
      } else {
        sessionStorage.setItem(TOKEN_KEY, newToken);
      }
    }

    return response;
  },
  (error) => {
    const status = error?.response?.status;

    console.error(
      `❌ API ERROR [${status}] ${error?.config?.url}`,
      error?.response?.data || error.message
    );

    if (status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/* =========================
   EXPORTS
========================= */
export { API_ENDPOINTS };
export default api;
