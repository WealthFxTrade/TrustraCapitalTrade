// src/api/apiService.js
import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'https://trustracapitaltrade-backend.onrender.com', // Production backend
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor – automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
