import axios from 'axios';

// Base API instance
const api = axios.create({
  // prioritize the Vercel Env Var, fallback to hardcoded URL
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true,
  timeout: 30000, // 🕒 Increased to 30s to allow Render.com to wake up
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ───── Auth & Profile (Crucial for AuthContext) ─────
export const getUserProfile = () => api.get('/auth/profile');
export const getSystemStatus = () => api.get('/system/status');

// ───── User APIs ─────
export const fetchUsers = () => api.get('/user');
export const updateUser = (id, data) => api.put(`/user/${id}`, data);
export const deleteUser = (id) => api.delete(`/user/${id}`);

// ───── KYC submission ─────
export const submitKyc = (formData) =>
  api.post('/user/kyc/submit', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });

export default api;

