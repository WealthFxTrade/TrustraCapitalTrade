import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const getAuditLogs = () => api.get('/admin/audit-logs');

export const adjustUserBalance = (userId, adjustmentData) => 
  api.post(`/admin/users/${userId}/adjust-balance`, adjustmentData);

