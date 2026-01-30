import { request } from './api';

// Register
export const register = async ({ fullName, email, password }) => {
  return await request('/auth/register', 'POST', { fullName, email, password });
};

// Login
export const login = async ({ email, password }) => {
  return await request('/auth/login', 'POST', { email, password });
};

// Forgot Password
export const forgotPassword = async (email) => {
  return await request('/auth/forgot-password', 'POST', { email });
};

// Reset Password
export const resetPassword = async (token, password) => {
  return await request(`/auth/reset-password/${token}`, 'POST', { password });
};
