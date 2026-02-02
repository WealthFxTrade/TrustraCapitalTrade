import axios from 'axios';

const api = axios.create({
  // Ensure this URL exactly matches your backend deployment
  baseURL: 'https://trustracapitaltrade-backend.onrender.com', 
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

/* ================= AUTH ================= */
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getUserAccount = () => api.get('/user/me');

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
// Corrected to a functional public API endpoint
export const getBtcPrice = () => axios.get('https://api.binance.com');

/* ================= PUBLIC DATA ================= */
export const getReviews = () => api.get('/reviews');

/* ================= KYC ================= */
export const submitKyc = (formData) =>
  api.post('/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getKycStatus = () => api.get('/kyc/status');

/* ================= REFERRALS ================= */
export const getReferralData = () => api.get('/referrals');

/* ================= ADMIN ================= */
export const adminStats = () => api.get('/admin/stats');
export const adminUsers = () => api.get('/admin/users');
export const adminKyc = () => api.get('/admin/kyc');
export const adminApproveKyc = (id) => api.post(`/admin/kyc/${id}/approve`);
// Added: Admin Management for Withdrawals/Deposits
export const adminUpdateTransaction = (id, status) => api.patch(`/admin/transactions/${id}`, { status });

