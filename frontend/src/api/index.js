import api from './apiService';

/**
 * TRUSTRA CAPITAL TRADE - CORE API MANIFEST (2026)
 * Standardized endpoints for User, Wallet, and Admin Operations.
 */

// ─── 1. AUTHENTICATION & PROFILE ───
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/user/me');
export const updateProfile = (data) => api.put('/user/me', data);

// ─── 2. WALLET & NODE OPERATIONS ───
/** Generates a unique BTC/ETH/USDT deposit address */
export const generateAddress = (asset) => api.post(`/wallet/generate/${asset}`);

/** Fetches real-time EUR balances and recent node activity */
export const getDashboardData = () => api.get('/user/dashboard');

/** Initiates an EUR liquidation request */
export const withdrawFunds = (data) => api.post('/transactions/withdraw', data);

// ─── 3. ADMIN OPERATIONS (Operations Center) ───
/** Aggregates global liquidity and user metrics */
export const adminStats = () => api.get('/admin/stats');

/** Retrieves the queue of investors awaiting KYC verification */
export const adminKyc = () => api.get('/admin/kyc');

/** Finalizes investor verification for 2026 Compliance */
export const adminApproveKyc = (userId) => api.post(`/admin/verify/${userId}`);

/** Manually adjust a user node balance (Admin Override) */
export const adminUpdateBalance = (data) => api.post('/admin/users/update-balance', data);

export default {
  login,
  register,
  getProfile,
  updateProfile,
  generateAddress,
  getDashboardData,
  withdrawFunds,
  adminStats,
  adminKyc,
  adminApproveKyc,
  adminUpdateBalance
};

