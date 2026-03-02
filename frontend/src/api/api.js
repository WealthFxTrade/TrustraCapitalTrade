import axios from 'axios';

const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev 
  ? '/api' 
  : 'https://trustracapitaltrade-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 
 * ── SPECIALIZED KYC UPLOAD ──
 * This is what KYC.jsx is looking for
 */
export const submitKYC = async (formData) => {
  const response = await api.post('/user/kyc-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Required for file uploads
    },
  });
  return response.data;
};

export default api;

