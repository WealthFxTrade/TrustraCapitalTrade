import axios from 'axios';
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL, withCredentials: true });

export const getDeposits = async () => {
  const res = await API.get('/api/deposits/history');
  return res.data.deposits;
};
