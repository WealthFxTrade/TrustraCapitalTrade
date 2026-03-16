// src/api/api.js
// Centralized Axios instance for all API calls in the Trustra Capital frontend
// Configured for cookie-based authentication (httpOnly trustra_token)

import axios from 'axios';

// ── Create the main Axios instance ──────────────────────────────────────────────────
const api = axios.create({
  // Use relative /api path → Vite proxy handles forwarding to backend
  baseURL: '/api',

  // Critical: Allows browser to send/receive httpOnly cookies automatically
  withCredentials: true,

  // Standard JSON content type
  headers: {
    'Content-Type': 'application/json',
  },

  // Timeout to prevent hanging requests
  timeout: 8000,
});

// ── Request Interceptor ─────────────────────────────────────────────────────────────
// Used for logging and future extensions (no token needed – cookies handle auth)
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(
        `[API →] \( {config.method.toUpperCase()} \){config.url}${
          config.params ? `?${new URLSearchParams(config.params).toString()}` : ''
        }`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────────────
// Logs responses, debug cookies, and centralizes error handling
api.interceptors.response.use(
  // Success
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API ←] \( {response.config.method.toUpperCase()} \){response.config.url} → ${response.status}`
      );

      // Debug: show Set-Cookie headers
      if (response.headers['set-cookie']) {
        console.log('[API COOKIE] Backend sent Set-Cookie:', response.headers['set-cookie']);
      }
    }
    return response;
  },

  // Error
  (error) => {
    // No response (network error, timeout, CORS, etc.)
    if (!error.response) {
      console.error(
        '[API ERROR] Network failure – server unreachable, timeout, or CORS issue',
        error.message
      );
      return Promise.reject(error);
    }

    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.message || 'Protocol Error';

    if (import.meta.env.DEV) {
      console.error(
        `[API ERROR] \( {status} – \){error.config.method.toUpperCase()} ${error.config.url}`,
        message
      );
    }

    // Special handling for 401
    if (status === 401) {
      console.warn('[API] 401 Unauthorized – Session Invalid or Expired');
      // Do NOT clear state here – let AuthContext handle it
    }

    return Promise.reject(error);
  }
);

// Export the configured instance
export default api;
