// src/api/api.jsx – production-ready single Axios instance
import axios from 'axios';

// In-memory + persistent token storage
let accessToken = localStorage.getItem('token') || null;

// Explicit exports for AuthContext and other consumers
export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const api = axios.create({
  // Use VITE_API_URL in production (Vercel env var)
  // Fallback only for local dev if .env missing
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  withCredentials: true,          // Required for HttpOnly refresh cookie
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach current token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh on 401, no auto-redirect/logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network / timeout / CORS error
    if (!error.response) {
      console.error('[API] Network/timeout error:', error.message);
      return Promise.reject({
        message: 'Network error – please check your connection',
      });
    }

    // Refresh token only once per failed 401 request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('[API] Attempting token refresh...');
        const refreshRes = await axios.post(
          '/auth/refresh',
          {},
          {
            baseURL: api.defaults.baseURL,
            withCredentials: true,
          }
        );

        const newToken = refreshRes.data?.accessToken || refreshRes.data?.token;
        if (!newToken) {
          throw new Error('No new token received from /auth/refresh');
        }

        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('[API] Token refreshed successfully');
        return api(originalRequest);
      } catch (refreshErr) {
        console.warn('[API] Refresh token failed:', refreshErr.message || refreshErr);

        // CRITICAL: Do NOT logout or redirect here
        // Let the component handle it (show error message, retry button, etc.)
        return Promise.reject({
          message: 'Session refresh failed. Please log in again.',
          status: refreshErr.response?.status,
          data: refreshErr.response?.data,
        });
      }
    }

    // Pass through other errors cleanly
    const message = error.response?.data?.message || 'API request failed';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
