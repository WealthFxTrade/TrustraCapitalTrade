// src/services/api/axiosInstance.js
import axios from 'axios';
import { getApiBaseUrl } from '@/constants/api';

/**
 * Unified Axios Instance using centralized base URL logic
 * Works for both Development and Production
 */
const BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

/**
 * REQUEST INTERCEPTOR
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 [axiosInstance] \( {config.method?.toUpperCase()} \){config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`❌ [axiosInstance] Error:`, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
