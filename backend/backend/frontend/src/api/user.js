import { request } from './api';

// Get current user profile
export const getProfile = async () => {
  const token = localStorage.getItem('token');
  return await request('/auth/me', 'GET', null, token);
};

// Update user profile (example: fullName)
export const updateProfile = async (data) => {
  const token = localStorage.getItem('token');
  return await request('/auth/update-profile', 'PUT', data, token);
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  return await request('/auth/change-password', 'POST', { currentPassword, newPassword }, token);
};
