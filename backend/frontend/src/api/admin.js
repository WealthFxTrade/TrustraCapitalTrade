import { request } from './api';

// Get pending withdrawals
export const getPendingWithdrawals = async () => {
  const token = localStorage.getItem('token');
  return await request('/transactions/pending-withdrawals', 'GET', null, token);
};

// Approve withdrawal
export const approveWithdrawal = async (withdrawalId, txHash) => {
  const token = localStorage.getItem('token');
  return await request(`/admin/withdrawals/${withdrawalId}/approve`, 'POST', { txHash }, token);
};

// Reject withdrawal
export const rejectWithdrawal = async (withdrawalId, reason) => {
  const token = localStorage.getItem('token');
  return await request(`/admin/withdrawals/${withdrawalId}/reject`, 'POST', { reason }, token);
};
