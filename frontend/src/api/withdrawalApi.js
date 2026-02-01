// src/api/withdrawalApi.js
import api from './api'; // your main axios instance

export const requestWithdrawal = async (data) => {
  return api.post('/withdraw/request', data);
};
