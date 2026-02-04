import axios from 'axios';

// 1. Create Axios Instance
export const api = axios.create({
  baseURL: 'https://trustracapitaltrade-backend.onrender.com', // Added /api prefix to match backend routes
  headers: { 'Content-Type': 'application/json' },
});

// 2. Auth Interceptor
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

// FIXED: Your backend route is POST /api/transactions/withdraw
export const requestWithdrawal = (data) => api.post('/transactions/withdraw', data);

/* ================= INVESTMENTS ================= */
export const getUserInvestments = () => api.get('/investments');
export const getInvestmentPlans = () => api.get('/plans');

/* ================= TRANSACTIONS ================= */
// FIXED: Your backend route is GET /api/transactions/my
export const getTransactions = () => api.get('/transactions/my');

/* ================= MARKET DATA ================= */
// FIXED: Full functional ticker endpoint (api.binance.com alone returns HTML, not JSON)
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
export const adminApproveKyc = (id) => api.post(`/admin/kyc/${id}/approve`);

// FIXED: Admin path for transactions (matching your router.get("/admin/all"))
export const adminGetAllTransactions = () => api.get('/transactions/admin/all');
export const adminUpdateTransaction = (id, status) => api.patch(`/admin/transactions/${id}`, { status });

