// src/api/user.js  (or src/api/auth.js – pick based on domain organization)
/**
 * TRUSTRA CAPITAL TRADE – User & Authentication API Functions
 *
 * All functions use the pre-configured axios instance (`api`) which automatically:
 *  - Attaches Bearer token
 *  - Handles 401 → logout & redirect
 *  - Normalizes errors
 *  - Adds timeout & base URL
 */

import api from './apiService';

/**
 * Get current authenticated user's profile
 * Endpoint: GET /api/auth/me
 *
 * @returns {Promise<Object>} User profile data (id, email, name, role, kycStatus, etc.)
 * @throws {Object} Normalized error { message, status, success: false }
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // Let the interceptor-normalized error bubble up
    throw error;
  }
};

/**
 * Update user profile (name, phone, avatar, preferences, etc.)
 * Endpoint: PUT /api/auth/update-profile
 *
 * @param {Object} userData – Partial user object (e.g. { name, phone, avatarUrl })
 * @returns {Promise<Object>} Updated user profile or success message
 * @throws {Object} Normalized error
 */
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/update-profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * Endpoint: POST /api/auth/change-password
 *
 * @param {string} currentPassword – User's existing password
 * @param {string} newPassword – New password
 * @returns {Promise<Object>} Success message or token if needed
 * @throws {Object} Normalized error (e.g. wrong current password → 400/401)
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Both current and new password are required');
  }

  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * (Optional) Upload avatar / profile picture
 * Endpoint: POST /api/auth/upload-avatar (multipart/form-data)
 *
 * @param {File} file – Image file (jpg/png)
 * @returns {Promise<Object>} { avatarUrl, message }
 */
export const uploadAvatar = async (file) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * (Optional) Get user KYC status
 * Endpoint: GET /api/auth/kyc-status
 */
export const getKycStatus = async () => {
  try {
    const response = await api.get('/auth/kyc-status');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getKycStatus,
};
