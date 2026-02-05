import api from './apiService'; 

/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Finalized for 2026 Production Environment.
 */

// Helper to extract .data from Axios responses automatically
const withData = (promise) => promise.then((res) => res.data);

// ────────────────────────────────────────────────
// AUTHENTICATION
// ────────────────────────────────────────────────
export const loginUser = (credentials) => withData(api.post('/auth/login', credentials));
export const registerUser = (data) => withData(api.post('/auth/register', data));

// ────────────────────────────────────────────────
// USER / PROFILE / BALANCE
// ────────────────────────────────────────────────
export const getProfile = () => withData(api.get('/user/me'));
export const updateProfile = (payload) => withData(api.put('/user/me', payload));
export const getUserBalance = () => withData(api.get('/user/balance'));
export const getWallet = () => withData(api.get('/wallet'));

// ────────────────────────────────────────────────
// DEPOSITS / WITHDRAWALS
// ────────────────────────────────────────────────
export const getDepositAddress = (currency) => withData(api.get(`/wallet/address?currency=${currency}`));
export const createDeposit = (data) => withData(api.post('/deposit', data));
export const requestWithdrawal = (data) => withData(api.post('/transactions/withdraw', data));

// ────────────────────────────────────────────────
// INVESTMENTS & PLANS
// ────────────────────────────────────────────────
export const getInvestmentPlans = () => withData(api.get('/plans'));
export const getUserInvestments = () => withData(api.get('/investments'));
export const subscribeToPlan = (planId, amount) => withData(api.post('/investments/subscribe', { planId, amount }));

// ────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ────────────────────────────────────────────────
// These must match the backend routes exactly
export const adminStats = () => withData(api.get('/admin/stats'));
export const adminUsers = () => withData(api.get('/admin/users'));
export const adminPendingKyc = () => withData(api.get('/admin/kyc/pending'));
export const adminApproveKyc = (id) => withData(api.post(`/admin/kyc/${id}/approve`));
export const adminRejectKyc = (id, reason) => withData(api.post(`/admin/kyc/${id}/reject`, { reason }));
export const adminUpdateTransaction = (id, status) => withData(api.patch(`/admin/transactions/${id}`, { status }));

/**
 * NAMED EXPORT FOR THE SERVICE ITSELF
 * Allows components to use 'api.get' or 'api.post' directly if needed.
 */
export { api }; 

