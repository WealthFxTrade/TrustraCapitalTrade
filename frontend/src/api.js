import axios from 'axios';

// Create Axios Instance
export const api = axios.create({
  baseURL: 'https://trustracapitaltrade-backend.onrender.com', 
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ================= AUTH & USER ================= */
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getUserBalance = () => api.get('/user/me');

/* ================= WALLET / PAYMENTS ================= */
export const getWallet = () => api.get('/wallet');
export const getDepositAddress = (currency) => api.get(`/wallet/address?currency=${currency}`);
export const createDeposit = (data) => api.post('/deposit', data);
export const requestWithdrawal = (data) => api.post('/withdraw', data);

/* ================= INVESTMENTS ================= */
export const getUserInvestments = () => api.get('/investments');
export const getInvestmentPlans = () => api.get('/plans');

/* ================= TRANSACTIONS ================= */
export const getTransactions = () => api.get('/transactions');

/* ================= MARKET DATA ================= */
// Updated to actual Binance ticker endpoint for 2026
export const getBtcPrice = () => axios.get('https://api.binance.com');

/* ================= KYC ================= */
export const submitKyc = (formData) =>
  api.post('/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getKycStatus = () => api.get('/kyc/status');

/* ================= ADMIN ================= */
export const adminStats = () => api.get('/admin/stats');
export const adminUsers = () => api.get('/admin/users');
export const adminKyc = () => api.get('/admin/kyc');

// ADDED: Missing export for AdminPanel.jsx
export const adminApproveKyc = (id) => api.post(`/admin/kyc/${id}/approve`);

export const adminUpdateTransaction = (id, status) => api.patch(`/admin/transactions/${id}`, { status });

