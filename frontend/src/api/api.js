// src/api/api.js
import api from '../constants/api';

/**
 * ── GENERIC SAFE REQUEST WRAPPER ──
 * Prevents UI freezing when backend is down
 */
const safeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('API FAILURE:', error.message || error);

    return {
      success: false,
      error: error.message || 'Service unavailable',
    };
  }
};

/**
 * ─────────────────────────────────────────
 * IDENTITY & USER MANAGEMENT
 * ─────────────────────────────────────────
 */
export const fetchUsers = () =>
  safeRequest(() => api.get('/admin/users'));

export const fetchUserDetail = (id) =>
  safeRequest(() => api.get(`/admin/users/${id}`));

export const updateUser = (id, data) =>
  safeRequest(() => api.patch(`/admin/users/${id}`, data));

export const deleteUser = (id) =>
  safeRequest(() => api.delete(`/admin/users/${id}`));

/**
 * ─────────────────────────────────────────
 * FINANCIAL & LEDGER OPERATIONS
 * ─────────────────────────────────────────
 */
export const fetchWithdrawals = () =>
  safeRequest(() => api.get('/admin/withdrawals'));

export const updateWithdrawalStatus = (id, status) =>
  safeRequest(() =>
    api.patch(`/admin/withdrawals/${id}`, { status })
  );

export const fetchDeposits = () =>
  safeRequest(() => api.get('/admin/deposits'));

export const updateDepositStatus = (id, status) =>
  safeRequest(() =>
    api.patch(`/admin/deposits/${id}`, { status })
  );

/**
 * ─────────────────────────────────────────
 * YIELD & RIO OPERATIONS
 * ─────────────────────────────────────────
 */
export const distributeProfit = (data) =>
  safeRequest(() =>
    api.post('/admin/distribute-profit', data)
  );

export const triggerManualRoi = () =>
  safeRequest(() => api.post('/admin/trigger-roi'));

/**
 * ─────────────────────────────────────────
 * SYSTEM & COMPLIANCE
 * ─────────────────────────────────────────
 */
export const fetchKycQueue = () =>
  safeRequest(() => api.get('/admin/kyc-queue'));

export const verifyKyc = (id, status) =>
  safeRequest(() =>
    api.patch(`/admin/kyc/${id}`, { status })
  );

export const fetchSystemHealth = () =>
  safeRequest(() => api.get('/admin/health'));

/**
 * Export base API if needed
 */
export default api;
