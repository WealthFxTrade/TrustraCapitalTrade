import axios from 'axios';
import { BASE_API_URL } from '../constants/api';

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API →] \( {config.method?.toUpperCase()} \){config.url} | Token: ${!!token}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - clearing token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
