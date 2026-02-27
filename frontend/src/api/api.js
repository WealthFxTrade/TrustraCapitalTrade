// src/api/api.js
import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css';
import { API_ENDPOINTS } from '../constants/api';

// ─── Axios Instance Configuration ───────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    nProgress.start();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    nProgress.done();
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    nProgress.done();
    return response;
  },
  (error) => {
    nProgress.done();
    const status = error.response?.status;
    
    if (status === 401) {
      localStorage.removeItem('token');
      // Only toast if we aren't already on the login page to avoid spam
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in.');
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTHENTICATION ──────────────────────────────────────────────────────
export const login = async (email, password) => {
  const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  // Ensure token is persisted immediately
  if (res.data.token) localStorage.setItem('token', res.data.token);
  return res.data;
};

export const register = async (data) => {
  const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  // Ensure token is persisted immediately
  if (res.data.token) localStorage.setItem('token', res.data.token);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } finally {
    // Always clear local storage even if the network call fails
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// ─── USER PROFILE ────────────────────────────────────────────────────────
export const fetchUserProfile = async () => {
  const res = await api.get(API_ENDPOINTS.USER.PROFILE);
  // Flattening response to return data directly for the Dashboard
  return res.data.user || res.data;
};

export const updateUserProfile = async (data) => {
  const res = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  return res.data;
};

// ─── ADMIN ───────────────────────────────────────────────────────────────
export const fetchUsers = async () => {
  const res = await api.get(API_ENDPOINTS.ADMIN.USERS);
  return res.data.users || res.data;
};

export default api;

