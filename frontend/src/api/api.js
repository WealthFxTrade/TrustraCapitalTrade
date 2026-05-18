// src/api/api.js

import axios from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/constants/api';

/**
 * ==============================
 * TOKEN STORAGE KEYS
 * ==============================
 */
const TOKEN_KEY = 'trustra_token';
const REMEMBER_KEY = 'trustra_remember';

/**
 * ==============================
 * AXIOS INSTANCE
 * ==============================
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * ==============================
 * GET TOKEN (SAFE SINGLE SOURCE)
 * ==============================
 */
const getToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
};

/**
 * ==============================
 * REQUEST INTERCEPTOR
 * ==============================
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ==============================
 * RESPONSE INTERCEPTOR
 * ==============================
 */
api.interceptors.response.use(
  (response) => {
    const newToken = response?.data?.token;

    if (newToken) {
      const remember =
        localStorage.getItem(REMEMBER_KEY) === 'true';

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

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);

      if (!['/login', '/', '/register'].includes(window.location.pathname)) {
        window.location.replace('/login?session=expired');
      }
    }

    if (!error.response) {
      console.error('Backend unreachable');
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }

    return Promise.reject(error);
  }
);

/**
 * ==============================
 * AUTH HELPERS
 * ==============================
 */
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

export { API_ENDPOINTS };
export default api;
