import api from './apiService'; // Use the unified engine

/**
 * Get pending withdrawals
 * Endpoint: GET /api/transactions/pending-withdrawals
 */
export const getPendingWithdrawals = async () => {
  // Token is automatically attached by the apiService interceptor
  const response = await api.get('/transactions/pending-withdrawals');
  return response.data;
};

/**
 * Approve withdrawal
 * Endpoint: POST /api/admin/withdrawals/:id/approve
 */
export const approveWithdrawal = async (withdrawalId, txHash) => {
  const response = await api.post(`/admin/withdrawals/${withdrawalId}/approve`, { txHash });
  return response.data;
};

/**
 * Reject withdrawal
 * Endpoint: POST /api/admin/withdrawals/:id/reject
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  const response = await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
  return response.data;
};

