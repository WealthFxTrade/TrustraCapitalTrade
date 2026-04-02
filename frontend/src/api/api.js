import api, { API_ENDPOINTS } from '../constants/api';

const safeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return { success: true, data: response.data };
  } catch (error) {
    console.error('PROTOCOL FAILURE:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Institutional Service currently unavailable',
    };
  }
};

export const fetchUsers = () => safeRequest(() => api.get(API_ENDPOINTS.ADMIN.USERS));
export const fetchUserDetail = (id) => safeRequest(() => api.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`));
export const updateUser = (id, data) => safeRequest(() => api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, data));
export const deleteUser = (id) => safeRequest(() => api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`));

export const fetchWithdrawals = () => safeRequest(() => api.get(API_ENDPOINTS.TRANSACTIONS.ALL_WITHDRAWALS));
export const updateWithdrawalStatus = (id, status) => 
  safeRequest(() => api.patch(`${API_ENDPOINTS.TRANSACTIONS.ALL_WITHDRAWALS}/${id}`, { status }));

export const fetchSystemHealth = () => safeRequest(() => api.get(API_ENDPOINTS.ADMIN.HEALTH));

export default api;
