import { request } from './api';

// Deposit request
export const deposit = async (amount, method = 'manual') => {
  const token = localStorage.getItem('token');
  return await request('/transactions/deposit', 'POST', { amount, method }, token);
};

// Withdrawal request
export const withdraw = async (amount, btcAddress) => {
  const token = localStorage.getItem('token');
  return await request('/transactions/withdraw', 'POST', { amount, btcAddress }, token);
};

// User transaction history
export const getMyTransactions = async () => {
  const token = localStorage.getItem('token');
  return await request('/transactions/my', 'GET', null, token);
};

// Admin: pending withdrawals
export const getPendingWithdrawals = async () => {
  const token = localStorage.getItem('token');
  return await request('/transactions/pending-withdrawals', 'GET', null, token);
};
