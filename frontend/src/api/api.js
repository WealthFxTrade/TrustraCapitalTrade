import axios from 'axios';
import { BASE_API_URL } from '../constants/api';

const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API →] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized – Redirecting or Clearing Session');
    }
    return Promise.reject(error);
  }
);

export default api;

