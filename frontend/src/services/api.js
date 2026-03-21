import axios from 'axios';

/**
 * ── ZURICH API GATEWAY ──
 * Base configuration for all Node-to-Node communication
 */
const api = axios.create({
  // Direct connection to your Termux Node.js port
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout for mobile network stability
});

/**
 * ── REQUEST INTERCEPTOR ──
 * Injects the Bearer Token from local storage into every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * ── RESPONSE INTERCEPTOR ──
 * Global error handling for 401 (Unauthorized) or 500 (Server Error)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Session expired or invalid token - Wipe registry and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Standardize error message for the UI toasts
    const message = response?.data?.message || 'Network Handshake Failed';
    return Promise.reject({ ...error, message });
  }
);

export default api;

