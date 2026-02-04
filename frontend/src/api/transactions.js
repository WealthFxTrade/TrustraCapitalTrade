import api from './apiService'; // Use the unified engine we built

/**
 * DEPOSIT REQUEST
 * Initializes a new investment deposit
 * Endpoint: POST /api/transactions/deposit
 */
export const deposit = async (amount, method = 'manual') => {
  // api already prepends baseURL + /api and attaches JWT via interceptors
  const response = await api.post('/transactions/deposit', { amount, method });
  return response.data;
};

/**
 * WITHDRAWAL REQUEST
 * Submits a Satoshi payout request to the admin queue
 * Endpoint: POST /api/transactions/withdraw
 */
export const withdraw = async (amount, btcAddress) => {
  const response = await api.post('/transactions/withdraw', { amount, btcAddress });
  return response.data;
};

/**
 * TRANSACTION HISTORY
 * Fetches the ledger for the currently logged-in investor
 * Endpoint: GET /api/transactions/my
 */
export const getMyTransactions = async () => {
  const response = await api.get('/transactions/my');
  return response.data;
};

/**
 * ADMIN: PENDING WITHDRAWALS
 * Fetches the global queue of payouts awaiting verification
 * Endpoint: GET /api/transactions/pending-withdrawals
 */
export const getPendingWithdrawals = async () => {
  const response = await api.get('/transactions/pending-withdrawals');
  return response.data;
};

/**
 * ADMIN: UPDATE STATUS
 * Approves or rejects a specific transaction
 * Endpoint: PATCH /api/transactions/:id/status
 */
export const updateTransactionStatus = async (id, status) => {
  const response = await api.patch(`/transactions/${id}/status`, { status });
  return response.data;
};

