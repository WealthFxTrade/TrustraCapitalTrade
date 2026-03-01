import axios from 'axios';

const TOKEN_KEY = 'trustra_token';
const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, 
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor (Inject Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🛰️ EXPLICIT NAMED EXPORT FOR KYC (Fixes Build Error)
export const submitKYC = async (formData) => {
  return await api.post('/user/kyc-upload', formData, {
    headers: {
      // Critical for file uploads so the browser sets the boundary
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
