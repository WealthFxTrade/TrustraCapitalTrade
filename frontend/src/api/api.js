import axios from 'axios';

const TOKEN_KEY = 'trustra_token';
const isDev = import.meta.env.MODE === 'development';

// In production, VITE_API_URL should be your Render/Heroku URL
const BASE_URL = isDev 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, 
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject JWT into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle Auth failures (Expired sessions)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * NAMED EXPORTS: Explicitly defined for Rollup build compatibility
 */
export const submitKYC = async (formData) => {
  return await api.post('/user/kyc-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default api;
