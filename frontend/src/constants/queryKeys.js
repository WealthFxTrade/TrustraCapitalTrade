// src/constants/queryKeys.js
// Centralized query keys for React Query (TanStack)

export const QUERY_KEYS = {
  // AUTH / USER
  USER: ['user'],

  // TRANSACTIONS
  TRANSACTIONS: ['transactions'],
  MY_TRANSACTIONS: ['myTransactions'],

  // ADMIN - USERS
  USERS: ['users'],

  // ADMIN - WITHDRAWALS
  WITHDRAWALS: ['withdrawals'],
  PENDING_WITHDRAWALS: ['pendingWithdrawals'],

  // KYC
  KYC_PENDING: ['kycPending'],
  KYC_STATS: ['kycStats'],

  // SYSTEM
  SYSTEM_HEALTH: ['systemHealth'],
  LEDGER: ['ledger'],
};
