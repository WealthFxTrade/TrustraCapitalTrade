// src/api/index.js
import api from './apiService';

/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Finalized for 2026 Production Environment
 *
 * Single public surface — all components MUST import only from here.
 * Example: import { login, getUserBalance, getTransactions } from '@/api';
 */

// ────────────────────────────────────────────────
// GENERIC HELPERS (normalize response to .data)
// ────────────────────────────────────────────────
const withData = (promise) => promise.then(res => res.data);

// ────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────
export const login = (credentials) => withData(api.post('/auth/login', credentials));

export const register = (data) => withData(api.post('/auth/register', data));

// ────────────────────────────────────────────────
// USER / PROFILE / BALANCE
// ────────────────────────────────────────────────
export const getUserBalance = () => withData(api.get('/user/me'));

export const getUserInvestments = () => withData(api.get('/investments'));

export const getInvestmentPlans = () => withData(api.get('/plans'));

// ────────────────────────────────────────────────
// TRANSACTIONS / DEPOSITS / WITHDRAWALS
// ────────────────────────────────────────────────
export const getTransactions = () => withData(api.get('/transactions/my'));

export const createDeposit = (data) => withData(api.post('/deposit', data));

export const requestWithdrawal = (data) => withData(api.post('/transactions/withdraw', data));

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

export const adminKyc = () => withData(api.get('/admin/kyc'));

export const adminApproveKyc = (id) => withData(api.post(`/admin/kyc/${id}/approve`));

export const adminGetAllTransactions = () => withData(api.get('/transactions/admin/all'));

export const adminUpdateTransaction = (id, status) =>
  withData(api.patch(`/admin/transactions/${id}`, { status }));

// ────────────────────────────────────────────────
// MARKET DATA (use backend proxy to avoid CORS)
// ────────────────────────────────────────────────
export const getBtcPrice = () => withData(api.get('/market/btc-price'));
