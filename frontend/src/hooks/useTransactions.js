import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/api/api';

// DEPOSIT
export const useDeposit = () => {
  return useMutation({
    mutationFn: ({ amount, method }) =>
      api.post('/transactions/deposit', { amount, method }),
  });
};

// WITHDRAW
export const useWithdraw = () => {
  return useMutation({
    mutationFn: ({ amount, btcAddress }) =>
      api.post('/transactions/withdraw', { amount, btcAddress }),
  });
};

// GET MY TRANSACTIONS
export const useMyTransactions = () => {
  return useQuery({
    queryKey: ['myTransactions'],
    queryFn: async () => {
      const res = await api.get('/transactions/my');
      return res.data;
    },
  });
};
