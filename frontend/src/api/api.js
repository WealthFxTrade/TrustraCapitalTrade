// src/api/api.js
import axios from 'axios';
import { API_URL } from '../constants/api';

// Create Axios instance with sensible defaults
const api = axios.create({
  baseURL: API_URL,                     // from src/constants/api.js
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,                       // 15 seconds - prevents indefinite hangs
  // withCredentials: true,             // Uncomment if using cookies/sessions instead of Bearer tokens
});

// ── REQUEST INTERCEPTOR ──
// Automatically adds Bearer token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Rare: request setup failed (e.g. invalid config)
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR ──
// Centralized error handling/logging - extremely useful for debugging
api.interceptors.response.use(
  // Success: pass through response
  (response) => response,

  // Error handling
  (error) => {
    // Detailed error logging (helps debug signup/login failures)
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle common status codes globally
    if (error.response) {
      const { status } = error.response;

      // 401/403 → token invalid/expired
      if (status === 401 || status === 403) {
        localStorage.removeItem('trustra_token');
        // Optional: force redirect to login (uncomment if needed)
        // window.location.href = '/login';
        // Or show toast: toast.error('Session expired. Please log in again.');
      }

      // 500+ → server error
      if (status >= 500) {
        // You can throw custom error or return fallback here
        // e.g. throw new Error('Server error - please try again later');
      }
    } else if (error.request) {
      // No response received → network issue, timeout, CORS, etc.
      console.warn('Network/Connection error - no response from server');
      // This is likely where "Protocol Error: Check your connection." messages come from
    } else {
      // Something broke before request (setup error)
      console.error('Request setup failed:', error.message);
    }

    // Optional: Simple retry logic for network errors (uncomment if needed)
    /*
    const config = error.config;
    if (!config || !config.__retryCount) config.__retryCount = 0;
    if (config.__retryCount >= 3) { // max 3 retries
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    const backoff = new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
    return backoff.then(() => api(config));
    */

    // Always reject so calling component can handle (e.g. show toast in Signup/Login)
    return Promise.reject(error);
  }
);

export default api;
