import { request } from './api'; 

/**
 * DEPOSIT REQUEST
 * Initializes a new investment deposit
 */
export const deposit = async (amount, method = 'manual') => {
  // Token is automatically attached by the apiService interceptor
  return await request('/transactions/deposit', 'POST', { amount, method });
};

/**
 * WITHDRAWAL REQUEST
 * Submits a Satoshi payout request to the admin queue
 */
export const withdraw = async (amount, btcAddress) => {
  return await request('/transactions/withdraw', 'POST', { amount, btcAddress });
};

/**
 * TRANSACTION HISTORY
 * Fetches the ledger for the currently logged-in investor
 */
export const getMyTransactions = async () => {
  return await request('/transactions/my', 'GET');
};

/**
 * ADMIN: PENDING WITHDRAWALS
 * Fetches the global queue of payouts awaiting verification
 */
export const getPendingWithdrawals = async () => {
  return await request('/transactions/pending-withdrawals', 'GET');
};

/**
 * ADMIN: UPDATE STATUS
 * Approves or rejects a specific transaction
 */
export const updateTransactionStatus = async (id, status) => {
  return await request(`/transactions/${id}/status`, 'PATCH', { status });
};

