import api from './apiService'; // Ensure this matches your base API filename

// --- USER ENDPOINTS ---

/** Fetch user's own withdrawals */
export const getWithdrawals = async () => {
  return await api.get('/transactions/my-withdrawals');
};

/** Request a new payout */
export const requestWithdrawal = async (data) => {
  return await api.post('/transactions/withdraw', data);
};

// --- ADMIN ENDPOINTS ---

/** Admin: Get all pending payout requests */
export const adminGetWithdrawals = async () => {
  return await api.get('/admin/withdrawals/pending');
};

/** Admin: Approve a payout */
export const adminApproveWithdrawal = async (id) => {
  return await api.post(`/admin/withdrawals/${id}/approve`);
};

/** Admin: Reject a payout */
export const adminRejectWithdrawal = async (id) => {
  return await api.post(`/admin/withdrawals/${id}/reject`);
};

