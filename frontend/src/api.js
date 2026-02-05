// src/api/index.js
import api from './apiService'; // your axios instance with interceptors

/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Finalized for 2026 Production Environment
 *
 * Single public surface — all components MUST import only from here.
 * Example:
 *   import { loginUser, getUserBalance, getTransactions } from '@/api';
 */

// ────────────────────────────────────────────────
// GENERIC HELPERS (normalize response to .data)
// ────────────────────────────────────────────────
const withData = (promise) => promise.then((res) => res.data);

// ────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────
export const loginUser = (credentials) => withData(api.post('/auth/login', credentials));

export const registerUser = (data) => withData(api.post('/auth/register', data));

// ────────────────────────────────────────────────
// USER / PROFILE / BALANCE
// ────────────────────────────────────────────────
export const getProfile = () => withData(api.get('/user/me'));

export const updateProfile = (payload) => withData(api.put('/user/me', payload));

export const getUserBalance = () => withData(api.get('/user/balance')); // or /wallet/balance if separate

export const getWallet = () => withData(api.get('/wallet'));

// ────────────────────────────────────────────────
// DEPOSITS / WITHDRAWALS
// ────────────────────────────────────────────────
export const getDepositAddress = (currency) =>
  withData(api.get(`/wallet/address?currency=${currency}`));

export const createDeposit = (data) => withData(api.post('/deposit', data));

export const requestWithdrawal = (data) => withData(api.post('/transactions/withdraw', data));

// ────────────────────────────────────────────────
// INVESTMENTS & PLANS
// ────────────────────────────────────────────────
export const getInvestmentPlans = () => withData(api.get('/plans'));

export const getUserInvestments = () => withData(api.get('/investments'));

export const subscribeToPlan = (planId, amount) =>
  withData(api.post('/investments/subscribe', { planId, amount }));

// ────────────────────────────────────────────────
// TRANSACTIONS
// ────────────────────────────────────────────────
export const getTransactions = () => withData(api.get('/transactions/my'));

export const getAllTransactionsAdmin = () => withData(api.get('/transactions/admin/all'));

// ────────────────────────────────────────────────
// MARKET DATA (backend proxy recommended to avoid CORS)
// ────────────────────────────────────────────────
export const getBtcPrice = () => withData(api.get('/market/btc-price')); // backend forwards to Binance

// ────────────────────────────────────────────────
// KYC
// ────────────────────────────────────────────────
export const submitKyc = (formData) =>
  withData(
    api.post('/kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );

export const getKycStatus = () => withData(api.get('/kyc/status'));

// ────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ────────────────────────────────────────────────
export const adminStats = () => withData(api.get('/admin/stats'));

export const adminUsers = () => withData(api.get('/admin/users'));

export const adminPendingKyc = () => withData(api.get('/admin/kyc/pending'));

export const adminApproveKyc = (id) => withData(api.post(`/admin/kyc/${id}/approve`));

export const adminRejectKyc = (id, reason) =>
  withData(api.post(`/admin/kyc/${id}/reject`, { reason }));

export const adminUpdateTransaction = (id, status) =>
  withData(api.patch(`/admin/transactions/${id}`, { status }));
