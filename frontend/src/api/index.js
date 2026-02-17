// src/api/index.js
// Central API export point – re-exports the unified, safe api instance
import api from './api';  // ← points to api.jsx (the good one)

/**
 * TRUSTRA CAPITAL - CORE API (2026 PRODUCTION)
 * Unified endpoint manifest to resolve all build dependencies.
 */

// ─── AUTH & PROFILE ───
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/user/me');
export const updateProfile = (data) => api.put('/user/me', data);

// ─── USER & DASHBOARD ───
export const getUserStats = () => api.get('/user/dashboard').then(res => res.data);
export const getUserTransactions = () => api.get('/transactions/my').then(res => res.data);

// ─── WALLET & KYC OPERATIONS ───
export const generateAddress = (asset) => api.post(`/wallet/generate/${asset}`);
export const getDepositAddress = (asset) => api.get(`/wallet/address/${asset}`);
export const withdrawFunds = (data) => api.post('/transactions/withdraw', data);

// ─── KYC SUBMISSION ───
export const submitKyc = (data) => api.post('/user/kyc', data);

// ─── ADMIN OPERATIONS ───
export const adminStats = () => api.get('/admin/stats');
export const adminKyc = () => api.get('/admin/kyc');
export const adminApproveKyc = (userId) => api.post(`/admin/verify/${userId}`);
export const adminUpdateBalance = (data) => api.post('/admin/users/update-balance', data);

// Default export (for "import api from '@/api'" style usage)
export default {
  login,
  register,
  getProfile,
  updateProfile,
  getUserStats,
  getUserTransactions,
  generateAddress,
  getDepositAddress,
  withdrawFunds,
  submitKyc,
  adminStats,
  adminKyc,
  adminApproveKyc,
  adminUpdateBalance,
};
