// src/api/api.js
import axios from 'axios';
import { getApiBaseUrl, API_ENDPOINTS } from '@/constants/api';

/* =========================
   STORAGE KEYS
========================= */
const TOKEN_KEY = 'trustra_token';
const REMEMBER_KEY = 'trustra_remember';

/* =========================
   AXIOS INSTANCE - FIXED
========================= */
const api = axios.create({
  baseURL: getApiBaseUrl(),   // This must be called at runtime
  timeout: 90000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* =========================
   TOKEN HELPERS
========================= */
const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

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

/* =========================
   INTERCEPTORS
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (import.meta.env.DEV) {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`❌ API ERROR [${error.response?.status}] ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
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
