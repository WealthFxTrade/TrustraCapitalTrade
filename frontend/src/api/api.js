/**
 * src/api/api.js - Production v8.4.1
 * Centralized API handler for Trustra Capital Trade.
 * Synchronized with Backend Port: 10000
 */
import axios from 'axios';

// 1. Base Configuration
// In dev, we use '/api' to trigger the Vite Proxy. In prod, we use the Render URL.
const BASE_URL = import.meta.env.MODE === 'development' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attach JWT Token from LocalStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Response Interceptor: Global Error Handling (Session Expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session if token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * ─── AUTHENTICATION ───
 */
export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data; // Returns { token, user }
};

export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

/**
 * ─── USER & PROFILE ───
 */
export const fetchUserProfile = async () => {
  const { data } = await api.get('/user/profile');
  return data; // Returns user object directly
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/user/profile', profileData);
  return data;
};

/**
 * ─── ADMINISTRATIVE (Admin Only) ───
 */
export const fetchUsers = async () => {
  const { data } = await api.get('/user/all');
  return data; // Returns Array of users directly
};

export const updateUserStatus = async (userId, statusData) => {
  const { data } = await api.patch(`/user/status/${userId}`, statusData);
  return data;
};

/**
 * ─── ASSETS & TRADING ───
 */
export const fetchBitcoinMarket = async () => {
  const { data } = await api.get('/bitcoin/market');
  return data;
};

export default api;
