// frontend/src/api/api.js
import api from '../constants/api'; // This should be your axios instance
import { API_ENDPOINTS } from '../constants/api';

/**
 * Professional wrapper for handling API responses and network failures.
 * This prevents the app from crashing on 404/500 errors.
 */
const safeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return { success: true, data: response.data };
  } catch (error) {
    // Log the specific endpoint that failed for easier debugging
    console.error(`[PROTOCOL FAILURE] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
    
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'Institutional Service currently unavailable',
    };
  }
};

// ── ADMIN SERVICES ──
export const fetchUsers = () => 
  safeRequest(() => api.get(API_ENDPOINTS.ADMIN.USERS));

export const fetchUserDetail = (id) => 
  safeRequest(() => api.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`));

export const updateUser = (id, data) => 
  safeRequest(() => api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, data));

export const deleteUser = (id) => 
  safeRequest(() => api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`));

// ── TRANSACTION SERVICES ──
export const fetchWithdrawals = () => 
  safeRequest(() => api.get(API_ENDPOINTS.TRANSACTIONS.ALL_WITHDRAWALS));

export const updateWithdrawalStatus = (id, status) =>
  safeRequest(() => api.patch(`${API_ENDPOINTS.TRANSACTIONS.ALL_WITHDRAWALS}/${id}`, { status }));

// ── SYSTEM SERVICES ──
export const fetchSystemHealth = () => 
  safeRequest(() => api.get(API_ENDPOINTS.ADMIN.HEALTH));

export default api;

