import api from './apiService'; // Your axios instance with interceptors

/**
 * TRUSTRA CAPITAL TRADE - API LAYER 2026
 * Finalized Production Sync
 */

// Helper to extract data from Axios response
const withData = (promise) => promise.then((res) => res.data);

// ────────────────────────────────────────────────
// AUTHENTICATION
// ────────────────────────────────────────────────
export const loginUser = (credentials) => 
  withData(api.post('/auth/login', credentials));

export const registerUser = (data) => 
  withData(api.post('/auth/register', data));

export const logoutUser = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// ────────────────────────────────────────────────
// USER & WALLET DATA
// ────────────────────────────────────────────────
export const getProfile = () => 
  withData(api.get('/user/me'));

export const updateProfile = (payload) => 
  withData(api.put('/user/me', payload));

// Fetches live balances for BTC, ETH, USDT
export const getUserBalance = () => 
  withData(api.get('/user/balances')); 

// ────────────────────────────────────────────────
// DEPOSITS (Address Generation & History)
// ────────────────────────────────────────────────

/**
 * FIXED: Generates unique address via Backend HD Derivation
 * Matches Backend: router.post('/wallet/:asset', protect, ...)
 */
export const getDepositAddress = (currency) => 
  withData(api.post(`/wallet/${currency.toUpperCase()}`));

/**
 * Fetches user-specific deposit history
 * Matches Backend: router.get('/deposits/my', protect, ...)
 */
export const getDepositHistory = () => 
  withData(api.get('/deposits/my'));

// ────────────────────────────────────────────────
// WITHDRAWALS
// ────────────────────────────────────────────────

/**
 * Submits a payout request and locks user balance
 * Matches Backend: router.post('/withdrawals/request', protect, ...)
 */
export const requestWithdrawal = (data) => 
  withData(api.post('/withdrawals/request', data));

// ────────────────────────────────────────────────
// INVESTMENTS & PLANS
// ────────────────────────────────────────────────
export const getInvestmentPlans = () => 
  withData(api.get('/plans'));

export const subscribeToPlan = (planId, amount) =>
  withData(api.post('/investments/subscribe', { planId, amount }));

// ────────────────────────────────────────────────
// TRANSACTIONS & MARKET
// ────────────────────────────────────────────────
export const getTransactions = () => 
  withData(api.get('/transactions/my'));

export const getBtcPrice = () => 
  withData(api.get('/market/btc-price'));

// ────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ────────────────────────────────────────────────
export const adminStats = () => withData(api.get('/admin/stats'));
export const adminUsers = () => withData(api.get('/admin/users'));
export const adminApproveDeposit = (id) => withData(api.patch(`/admin/deposits/${id}/approve`));
export const adminRejectDeposit = (id) => withData(api.patch(`/admin/deposits/${id}/reject`));

