// src/api/apiService.js
import axios from 'axios';

const getBaseURL = () => {
  let base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';
  base = base.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.debug(`[API →] \( {config.method?.toUpperCase()} \){config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = `/login?reason=expired&from=${encodeURIComponent(currentPath)}`;
      }
      return Promise.reject({ message: 'Session expired. Please log in again.', status: 401 });
    }

    const normalizedError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Something went wrong. Please try again.',
      status: error.response?.status || 500,
      success: false,
      data: error.response?.data || null,
    };

    if (import.meta.env.DEV) {
      console.error('[API ERROR]', normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
