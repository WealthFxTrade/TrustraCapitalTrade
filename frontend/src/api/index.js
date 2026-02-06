import api from './apiService';                      

/**
 * TRUSTRA CAPITAL TRADE - API LAYER (FEB 2026)
 * Synchronized with backend/routes/userRoutes.js
 */

const withData = (promise) => promise.then((res) => res.data);

// --- AUTHENTICATION ---
export const loginUser = (credentials) =>
  withData(api.post('/auth/login', credentials));

export const registerUser = (data) =>
  withData(api.post('/auth/register', data));

// --- USER / PROFILE / DASHBOARD ---
// FIXED: Changed to /user/me to match your backend/routes/userRoutes.js
export const getProfile = (config = {}) =>             
  withData(api.get('/user/me', config));          

// FIXED: Changed to PUT /user/me to match your backend/routes/userRoutes.js
export const updateProfile = (payload, config = {}) =>
  withData(api.put('/user/me', payload, config));  

export const getDashboardStats = (config = {}) =>
  withData(api.get('/user/dashboard', config));

export const getUserBalance = (config = {}) =>
  withData(api.get('/user/balance', config));                                        

// --- DEPOSITS / WITHDRAWALS ---
// FIXED: Updated to match transaction.js logic
export const getDepositAddress = (currency = 'BTC') =>
  withData(api.post('/transactions/deposit', { currency }));

export const requestWithdrawal = (data) =>
  withData(api.post('/transactions/withdraw', data));                                             

// --- TRANSACTIONS ---
// FIXED: Updated to match /transactions/my route
export const getTransactions = (config = {}) =>
  withData(api.get('/transactions/my', config));

// --- INVESTMENTS & PLANS ---
export const getInvestmentPlans = (config = {}) =>
  withData(api.get('/plans', config));

// FIXED: Updated to match the /plans/invest route we built
export const subscribeToPlan = (planId, amount) =>
  withData(api.post('/plans/invest', { planId, amount }));

// --- MARKET DATA ---
export const getBtcPrice = (config = {}) =>
  withData(api.get('/market/btc-price', config));

// --- ADMIN ENDPOINTS ---
export const adminUsers = (config = {}) =>             
  withData(api.get('/users', config));

// FIXED: Matches the admin deposit approval route
export const adminApproveDeposit = (userId, transactionId) =>
  withData(api.post('/users/approve-deposit', { userId, transactionId }));                                      

export { api };

