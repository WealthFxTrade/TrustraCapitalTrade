import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // send cookies for auth
});

// Get user balances
export const getBalances = async () => {
  const res = await API.get('/api/user/balances');
  return res.data;
};

// Generic deposit address fetch for any asset
export const getDepositAddress = async (asset = 'BTC', fresh = false) => {
  try {
    const res = await API.get(`/api/wallet/${asset.toLowerCase()}?fresh=${fresh}`);
    if (!res.data.address) throw new Error('No address returned from API');
    return res.data.address;
  } catch (err) {
    throw new Error(err.response?.data?.message || `Failed to generate ${asset} address`);
  }
};

// Convenience function for BTC (kept for backward compatibility)
export const getBtcAddress = async (fresh = false) => getDepositAddress('BTC', fresh);
