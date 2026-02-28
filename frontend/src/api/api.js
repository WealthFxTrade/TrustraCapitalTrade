import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css';
import { API_ENDPOINTS, API_URL } from '../constants/api';

/**
 * ─── Axios Instance Configuration ───────────────────────────────────────
 * Uses the API_URL from constants which defaults to the Render backend.
 */
const api = axios.create({
  baseURL: API_URL, 
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
      // Prevent redirect loops if already on login
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in.');
        window.location.href = '/login';
      }
    }
    
    // Handle 404s specifically for API debugging
    if (status === 404) {
      console.error(`[API 404] Route not found: ${error.config.url}`);
    }

    return Promise.reject(error);
  }
);

// ─── AUTHENTICATION ──────────────────────────────────────────────────────
export const login = async (email, password) => {
  // Uses synchronized constant '/auth/login' -> total: .../api/auth/login
  const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { 
    email: email.trim().toLowerCase(), 
    password 
  });
  
  const data = res.data;
  const token = data.token || data.accessToken;
  
  if (token) {
    localStorage.setItem('token', token);
  }
  return data;
};

export const register = async (userData) => {
  const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  if (res.data.token) localStorage.setItem('token', res.data.token);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (err) {
    console.warn('Backend logout failed, clearing local session anyway.');
  } finally {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// ─── USER PROFILE ────────────────────────────────────────────────────────
export const fetchUserProfile = async () => {
  const res = await api.get(API_ENDPOINTS.USER.PROFILE);
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
