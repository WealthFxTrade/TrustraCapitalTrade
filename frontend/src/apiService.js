import axios from 'axios';

/**
 * Trustra Capital Trade - API Service (Rio Series 2026)
 * Handles Global Interceptors, Auth Injection, and Node Synchronization.
 */

const getBaseURL = () => {
  let base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';
  base = base.replace(/\/+$/, ''); // Strip trailing slashes
  return base.endsWith('/api') ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ────────────────────────────────────────────────
// 1. Request Interceptor: Auth & Logging
// ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.debug(`[NODE_OUTBOUND] ${config.method?.toUpperCase()} → ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ────────────────────────────────────────────────
// 2. Response Interceptor: Error Normalization & Auto-Logout
// ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Expired/Invalid Token)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      
      // Prevent redirect loops if already on auth pages
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?reason=expired&from=${encodeURIComponent(currentPath)}`;
      }
      return Promise.reject({ message: 'Session expired. Re-authentication required.', status: 401 });
    }

    // Standardize Error Object for Frontend (Toasts/Modals)
    const normalizedError = {
      message: error.response?.data?.message || error.message || 'Node Synchronization Failure',
      status: error.response?.status || 500,
      success: false,
      data: error.response?.data || null,
    };

    if (import.meta.env.DEV) {
      console.error('[NODE_INBOUND_ERROR]', normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

// ────────────────────────────────────────────────
// 3. Optimized API Methods (ESM Exports)
// ────────────────────────────────────────────────

// --- Profile & User Node ---
export const getProfile = () => api.get('/user/me');
export const updateProfile = (data) => api.put('/user/me', data);
export const getDashboard = () => api.get('/user/dashboard');
export const getBalances = () => api.get('/user/balance');

// --- Wallet & Transactions ---
export const generateWallet = (asset) => api.post(`/wallet/generate/${asset}`);
export const getTransactionHistory = () => api.get('/transactions/my');

// --- Admin Operations ---
export const adminApproveDeposit = (depositId) => api.post('/users/approve-deposit', { depositId });
export const adminGetUsers = () => api.get('/users');
export const adminUpdateBalance = (id, data) => api.put(`/users/${id}/balance`, data);

export default api;

