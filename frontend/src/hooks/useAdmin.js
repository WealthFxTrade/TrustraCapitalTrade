import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/api/api';

// GET PENDING WITHDRAWALS
export const usePendingWithdrawals = () => {
  return useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const res = await api.get('/transactions/pending-withdrawals');
      return res.data;
    },
  });
};

// APPROVE WITHDRAWAL
export const useApproveWithdrawal = () => {
  return useMutation({
    mutationFn: ({ id, txHash }) =>
      api.post(`/admin/withdrawals/${id}/approve`, { txHash }),
  });
};

// REJECT WITHDRAWAL
export const useRejectWithdrawal = () => {
  return useMutation({
    mutationFn: ({ id, reason }) =>
      api.post(`/admin/withdrawals/${id}/reject`, { reason }),
  });
};
