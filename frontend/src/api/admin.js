import api, { API_ENDPOINTS } from '../constants/api';

export const getUsers = async () => {
  const { data } = await api.get(API_ENDPOINTS.ADMIN.USERS);
  return data;
};

export const updateUserBalance = async (userId, balance) => {
  const { data } = await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/balance`, { balance });
  return data;
};

export const getWithdrawals = async () => {
  const { data } = await api.get(API_ENDPOINTS.ADMIN.WITHDRAWALS);
  return data;
};

export const updateWithdrawalStatus = async (id, status) => {
  const { data } = await api.patch(`${API_ENDPOINTS.ADMIN.WITHDRAWALS}/${id}`, { status });
  return data;
};

// KYC
export const getPendingKyc = async () => {
  const { data } = await api.get(`${API_ENDPOINTS.ADMIN.KYC}/pending`);
  return data;
};

export const approveKyc = async (id) => {
  const { data } = await api.put(`${API_ENDPOINTS.ADMIN.KYC}/verify`, { kycId: id, status: 'approved' });
  return data;
};

export const rejectKyc = async (id) => {
  const { data } = await api.put(`${API_ENDPOINTS.ADMIN.KYC}/verify`, { kycId: id, status: 'rejected' });
  return data;
};
