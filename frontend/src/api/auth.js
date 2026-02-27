import api from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * REGISTER
 */
export const register = async ({ fullName, email, password }) => {
  const response = await api.post(API_ENDPOINTS.REGISTER, { fullName, email, password });
  return response.data;
};

/**
 * LOGIN
 */
export const login = async ({ email, password }) => {
  const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });

  if (response.data?.success && response.data?.token) {
    localStorage.setItem('token', response.data.token);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  }

  return response.data;
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (email) => {
  const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  return response.data;
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (token, password) => {
  const response = await api.post(API_ENDPOINTS.RESET_PASSWORD(token), { password });
  return response.data;
};

/**
 * LOGOUT
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.replace('/login');
};
