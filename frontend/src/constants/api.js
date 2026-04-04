import axios from 'axios';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    STATS: '/user/stats',
    HISTORY: '/user/transactions',
  },
  INVESTMENTS: {
    PLANS: '/investments',
    SUBSCRIBE: '/investments/subscribe',
    CURRENT: '/investments/current',
  },
  ADMIN: {
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    HEALTH: '/admin/health',
  }
};

// Auto-detect if we are on Localhost, Network IP, or Production
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:10000/api';
  // If accessing via 172.20.10.3, point to the backend on that same IP
  return `http://${hostname}:10000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Fallback: Attach token from localStorage if cookie is blocked by browser security
    const token = localStorage.getItem('trustra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) console.log(`🚀 [API Request]: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // If login is successful, save the token to localStorage as a fallback for the cookie
    if (response.config.url.includes('/auth/login') && response.data.token) {
      localStorage.setItem('trustra_token', response.data.token);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const isAuthPage = ['/login', '/register', '/signup'].includes(window.location.pathname);
      if (!isAuthPage) {
        localStorage.removeItem('trustra_token'); // Clear stale token
        window.location.replace('/login?session=expired');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

