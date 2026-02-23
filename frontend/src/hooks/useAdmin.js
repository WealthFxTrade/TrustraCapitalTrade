import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../api/api';

export const usePendingWithdrawals = () => {
  return useQuery(['pendingWithdrawals'], () => request('/transactions/pending-withdrawals', 'GET', null, localStorage.getItem('token')));
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, txHash }) => request(`/admin/withdrawals/${id}/approve`, 'POST', { txHash }, localStorage.getItem('token')),
    {
      onSuccess: () => queryClient.invalidateQueries(['pendingWithdrawals']),
    }
  );
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, reason }) => request(`/admin/withdrawals/${id}/reject`, 'POST', { reason }, localStorage.getItem('token')),
    {
      onSuccess: () => queryClient.invalidateQueries(['pendingWithdrawals']),
    }
  );
};
