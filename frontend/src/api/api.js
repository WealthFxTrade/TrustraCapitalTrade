// src/api/api.js
import axios from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/constants/api';

const TOKEN_KEY = 'trustra_token';
const REMEMBER_KEY = 'trustra_remember';

/**
 * AXIOS INSTANCE
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * GET TOKEN
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`🚀 \( {config.method?.toUpperCase()} \){config.url}`, config.data || '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => {
    // Handle new token returned from backend
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
    const url = error?.config?.url;

    console.error(`❌ API Error [\( {status}] \){url}`, error.response?.data || error.message);

    if (status === 401) {
      clearAuthToken();
      if (!['/login', '/', '/register'].includes(window.location.pathname)) {
        window.location.replace('/login?session=expired');
      }
    }

    if (status === 404) {
      console.warn(`🔍 404 Not Found → ${url}. Check backend route.`);
    }

    if (!error.response) {
      console.error('🌐 Network Error - Backend unreachable or CORS issue');
    }

    return Promise.reject(error);
  }
);

/* ====================== AUTH HELPERS ====================== */
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

export { API_ENDPOINTS };
export default api;
