import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from '../api/api';

export const useDeposit = () => {
  return useMutation(({ amount, method }) => request('/transactions/deposit', 'POST', { amount, method }, localStorage.getItem('token')));
};

export const useWithdraw = () => {
  return useMutation(({ amount, btcAddress }) => request('/transactions/withdraw', 'POST', { amount, btcAddress }, localStorage.getItem('token')));
};

export const useMyTransactions = () => {
  return useQuery(['myTransactions'], () => request('/transactions/my', 'GET', null, localStorage.getItem('token')));
};
