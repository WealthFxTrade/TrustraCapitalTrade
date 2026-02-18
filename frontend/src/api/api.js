import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true,
  timeout: 10000,
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

// ───── User APIs ─────
export const fetchUsers = () => api.get('/user');                     // GET all users (admin)
export const updateUser = (id, data) => api.put(`/user/${id}`, data); // PUT user update
export const deleteUser = (id) => api.delete(`/user/${id}`);          // DELETE (placeholder backend)
export const distributeProfit = (id, payload) => api.put(`/user/${id}`, payload); // Distribute profit

// ───── KYC submission ─────
export const submitKyc = (formData) =>
  api.post('/user/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;
