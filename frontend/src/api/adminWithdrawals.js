import { request } from './api';

/**
 * FETCH PENDING WITHDRAWALS
 * Retrieves the global queue of payout requests awaiting admin review.
 */
export const getPendingWithdrawals = async () => {
  // Interceptor automatically attaches the Authorization header
  return await request('/transactions/pending-withdrawals', 'GET');
};

/**
 * APPROVE WITHDRAWAL
 * Confirms the payout and attaches the blockchain Transaction Hash (txHash).
 */
export const approveWithdrawal = async (withdrawalId, txHash) => {
  return await request(`/admin/withdrawals/${withdrawalId}/approve`, 'POST', { txHash });
};

/**
 * REJECT WITHDRAWAL
 * Cancels the payout and sends a reason to the investor.
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  return await request(`/admin/withdrawals/${withdrawalId}/reject`, 'POST', { reason });
};

