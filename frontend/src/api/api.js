// src/api/api.js

import axios from 'axios';

import {
  getApiBaseUrl,
  API_ENDPOINTS,
} from '@/constants/api';

/**
 * ============================================
 * AXIOS INSTANCE
 * ============================================
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),

  withCredentials: true,

  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================================
 * REQUEST INTERCEPTOR
 * ============================================
 * Automatically attaches auth token
 * ============================================
 */
api.interceptors.request.use(
  (config) => {
    const localToken =
      localStorage.getItem('trustra_token');

    const sessionToken =
      sessionStorage.getItem('trustra_token');

    const token = localToken || sessionToken;

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/**
 * ============================================
 * RESPONSE INTERCEPTOR
 * ============================================
 * Handles:
 *  - Token persistence
 *  - Session expiration
 *  - Redirect protection
 * ============================================
 */
api.interceptors.response.use(
  (response) => {
    /**
     * Save new token if returned
     */
    if (response.data?.token) {
      const rememberMe =
        localStorage.getItem('trustra_remember') === 'true';

      if (rememberMe) {
        localStorage.setItem(
          'trustra_token',
          response.data.token
        );
      } else {
        sessionStorage.setItem(
          'trustra_token',
          response.data.token
        );
      }
    }

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    /**
     * Handle unauthorized responses
     */
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      /**
       * Clear stored auth
       */
      localStorage.removeItem('trustra_token');
      localStorage.removeItem('trustra_remember');

      sessionStorage.removeItem('trustra_token');

      /**
       * Prevent redirect loop
       */
      const currentPath =
        window.location.pathname;

      const publicPaths = [
        '/',
        '/login',
        '/register',
        '/forgotpassword',
      ];

      const isPublicPage =
        publicPaths.includes(currentPath);

      if (!isPublicPage) {
        window.location.href =
          '/login?reason=session_expired';
      }
    }

    /**
     * Network / timeout logging
     */
    if (!error.response) {
      console.error(
        'Network Error: Backend unreachable'
      );
    }

    if (error.code === 'ECONNABORTED') {
      console.error(
        'Request Timeout: Server took too long to respond'
      );
    }

    return Promise.reject(error);
  }
);

/**
 * ============================================
 * AUTH TOKEN HELPERS
 * ============================================
 */
export const setAuthToken = (
  token,
  rememberMe = false
) => {
  if (!token) {
    return;
  }

  if (rememberMe) {
    localStorage.setItem(
      'trustra_token',
      token
    );

    localStorage.setItem(
      'trustra_remember',
      'true'
    );

    sessionStorage.removeItem(
      'trustra_token'
    );
  } else {
    sessionStorage.setItem(
      'trustra_token',
      token
    );

    localStorage.removeItem(
      'trustra_token'
    );
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('trustra_token');

  localStorage.removeItem(
    'trustra_remember'
  );

  sessionStorage.removeItem(
    'trustra_token'
  );
};

/**
 * ============================================
 * EXPORTS
 * ============================================
 */
export default api;

export {
  API_ENDPOINTS,
};
