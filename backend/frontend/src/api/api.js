// src/api/api.js (add or modify at the end)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://trustracapitaltrade-backend.onrender.com/api', // your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global toast here if wanted
    return Promise.reject(error);
  }
);

export default api;   // ← THIS LINE IS REQUIRED
