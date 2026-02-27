// src/api/index.js
import api from './api';
import { API_ENDPOINTS } from '../constants/api';

// ─── AUTH & PROFILE ───
export const login = (data) => api.post(API_ENDPOINTS.LOGIN, data);
export const register = (data) => api.post(API_ENDPOINTS.REGISTER, data);
export const getProfile = () => api.get(API_ENDPOINTS.PROFILE);
export const updateProfile = (data) => api.put(API_ENDPOINTS.PROFILE, data);

// ─── USER & DASHBOARD ───
export const getUserStats = () => api.get(API_ENDPOINTS.USER_DASHBOARD).then(res => res.data);
export const getUserTransactions = () => api.get(API_ENDPOINTS.USER_TRANSACTIONS).then(res => res.data);

// ─── WALLET & TRANSACTIONS ───
export const generateAddress = (asset) => api.post(API_ENDPOINTS.WALLET_GENERATE(asset));
export const getDepositAddress = (asset) => api.get(API_ENDPOINTS.WALLET_ADDRESS(asset));
export const withdrawFunds = (data) => api.post(API_ENDPOINTS.WITHDRAWAL, data);

// ─── KYC ───
export const submitKyc = (data) => api.post(API_ENDPOINTS.KYC_SUBMIT, data);

// ... keep other exports
export default {
  login,
  register,
  getProfile,
  updateProfile,
  getUserStats,
  getUserTransactions,
  generateAddress,
  getDepositAddress,
  withdrawFunds,
  submitKyc,
  // add more as needed
};
