import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// ───── USER & ADMIN APIs ─────
export const fetchUsers = () => api.get('/user');
export const updateUser = (id, data) => api.put(`/user/${id}`, data);
export const deleteUser = (id) => api.delete(`/user/${id}`);
export const distributeProfit = (id, payload) => api.put(`/user/distribute/${id}`, payload);

// ───── AUTH & PROFILE APIs ─────
export const getUserProfile = () => api.get('/auth/profile');

// ───── KYC SUBMISSION API ─────
export const submitKyc = (formData) =>
  api.post('/user/kyc/submit', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });

export default api;

