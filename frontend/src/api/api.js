import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api', // ✅ /api prefix
  withCredentials: true,
  timeout: 30000,
});

// ── REQUEST INTERCEPTOR ──
api.interceptors.request.use(
  (config) => {
    nProgress.start();
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    nProgress.done();
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR ──
api.interceptors.response.use(
  (response) => {
    nProgress.done();
    return response;
  },
  (error) => {
    nProgress.done();
    const status = error.response?.status;
    if (status === 401) localStorage.removeItem('token');
    else if (error.response?.data?.message) toast.error(error.response.data.message);
    else if (!error.response) toast.error('Network error. Please check your connection.');
    return Promise.reject(error);
  }
);

export default api;

// ── AUTH ENDPOINTS ──
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

// ── USER ENDPOINTS ──
export const fetchUserProfile = async () => {
  const res = await api.get('/user/profile');
  return res.data;
};

export const updateUserProfile = async (data) => {
  const res = await api.put('/user/profile', data);
  return res.data;
};

// ── ADMIN ENDPOINTS ──
export const fetchUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const distributeProfit = async (data) => {
  const res = await api.post('/admin/distribute-profit', data);
  return res.data;
};

// ── KYC ENDPOINTS ──
export const submitKYC = async (formData) => {
  const res = await api.post('/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

// ── INVESTMENT ENDPOINTS ──
export const fetchInvestments = async () => {
  const res = await api.get('/investment');
  return res.data;
};

export const createInvestment = async (data) => {
  const res = await api.post('/investment', data);
  return res.data;
};

// ── DEPOSIT & WITHDRAWAL ENDPOINTS ──
export const createDeposit = async (data) => {
  const res = await api.post('/deposit', data);
  return res.data;
};

export const createWithdrawal = async (data) => {
  const res = await api.post('/withdrawal', data);
  return res.data;
};

// ── WALLET & TRANSACTION ENDPOINTS ──
export const fetchWallets = async () => {
  const res = await api.get('/wallet');
  return res.data;
};

export const fetchTransactions = async () => {
  const res = await api.get('/transactions');
  return res.data;
};

// ── BITCOIN ENDPOINT ──
export const fetchBitcoinPrice = async () => {
  const res = await api.get('/bitcoin/price');
  return res.data;
};

// ── PLAN ENDPOINT ──
export const fetchPlans = async () => {
  const res = await api.get('/plans');
  return res.data;
};

// ── REVIEWS ENDPOINT ──
export const submitReview = async (data) => {
  const res = await api.post('/reviews', data);
  return res.data;
};
