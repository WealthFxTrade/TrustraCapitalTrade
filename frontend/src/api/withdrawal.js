import axios from 'axios';
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL, withCredentials: true });

export const requestWithdrawal = async (asset, amount, address) => {
  const res = await API.post('/api/withdrawals/request', { asset, amount, address });
  return res.data;
};

export const getWithdrawals = async () => {
  const res = await API.get('/api/withdrawals/history');
  return res.data.withdrawals;
};
