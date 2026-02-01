import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_API_BASE;

export const getWallet = () =>
  axios.get(`${BACKEND_URL}/wallet`, { withCredentials: true });

export const getWithdrawals = () =>
  axios.get(`${BACKEND_URL}/withdrawals`, { withCredentials: true });

export const requestWithdrawal = (data) =>
  axios.post(`${BACKEND_URL}/withdraw`, data, { withCredentials: true });

export const getDeposits = (currency = 'BTC') =>
  axios.get(`${BACKEND_URL}/deposits/${currency.toLowerCase()}`, { withCredentials: true });

export const getDepositHistory = (currency = 'BTC') =>
  axios.get(`${BACKEND_URL}/deposits/${currency.toLowerCase()}/history`, { withCredentials: true });
