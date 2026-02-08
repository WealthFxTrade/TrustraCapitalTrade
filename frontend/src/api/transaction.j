import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Fetch recent transactions for user
export const getRecentTransactions = async (limit = 5) => {
  const res = await API.get(`/api/transactions/recent?limit=${limit}`);
  return res.data.transactions || [];
};
