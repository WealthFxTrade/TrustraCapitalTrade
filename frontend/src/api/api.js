// frontend/src/api/api.js
import axios from 'axios';

const isDev = import.meta.env.DEV;

// IMPORTANT: backend already exposes /api in production
const API_BASE_URL = isDev
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

const SOCKET_URL = isDev
  ? 'http://localhost:10000'
  : (import.meta.env.VITE_SOCKET_URL || 'https://trustracapitaltrade-backend.onrender.com');

console.log(`[API] Mode: ${isDev ? 'DEV' : 'PROD'}`);
console.log(`[API] Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth expiry
api.interceptors.response.use(
  (res) => {
    if (res.data?.token) {
      localStorage.setItem('trustra_token', res.data.token);
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trustra_token');
    }
    return Promise.reject(err);
  }
);

export default api;
export { SOCKET_URL };
