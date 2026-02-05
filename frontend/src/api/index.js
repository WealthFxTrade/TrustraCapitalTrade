import api from './apiService';

/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Corrected & hardened for 2026 production.
 */

const withData = (promise) => promise.then((res) => res.data);

// --- AUTHENTICATION ---
export const loginUser = (credentials) =>
  withData(api.post('/auth/login', credentials));

export const registerUser = (data) =>
  withData(api.post('/auth/register', data));

// --- USER / PROFILE / BALANCE ---
export const getProfile = (config = {}) =>
  withData(api.get('/user/me', config));

export const updateProfile = (payload, config = {}) =>
  withData(api.put('/user/me', payload, config));

export const getUserBalance = (config = {}) =>
  withData(api.get('/user/balance', config));

export const getWallet = (config = {}) =>
  withData(api.get('/wallet', config));

// --- DEPOSITS / WITHDRAWALS ---
export const getDepositAddress = (currency, config = {}) =>
  withData(api.get(`/wallet/address?currency=${currency}`, config));

export const createDeposit = (data, config = {}) =>
  withData(api.post('/deposit', data, config));

export const requestWithdrawal = (data, config = {}) =>
  withData(api.post('/transactions/withdraw', data, config));

// --- TRANSACTIONS ---
export const getTransactions = (config = {}) =>
  withData(api.get('/transactions/my', config));

// --- INVESTMENTS & PLANS ---
export const getInvestmentPlans = (config = {}) =>
  withData(api.get('/plans', config));

export const getUserInvestments = (config = {}) =>
  withData(api.get('/investments', config));

export const subscribeToPlan = (planId, amount, config = {}) =>
  withData(
    api.post('/investments/subscribe', { planId, amount }, config)
  );

// --- MARKET DATA ---
export const getBtcPrice = (config = {}) =>
  withData(api.get('/market/btc-price', config));

// --- ADMIN ENDPOINTS ---
export const adminStats = (config = {}) =>
  withData(api.get('/admin/stats', config));

export const adminUsers = (config = {}) =>
  withData(api.get('/admin/users', config));

export const adminPendingKyc = (config = {}) =>
  withData(api.get('/admin/kyc/pending', config));

export const adminApproveKyc = (id, config = {}) =>
  withData(api.post(`/admin/kyc/${id}/approve`, {}, config));

export const adminRejectKyc = (id, reason, config = {}) =>
  withData(api.post(`/admin/kyc/${id}/reject`, { reason }, config));

export const adminUpdateTransaction = (id, status, config = {}) =>
  withData(
    api.patch(`/admin/transactions/${id}`, { status }, config)
  );

export { api };
