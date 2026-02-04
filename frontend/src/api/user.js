import api from './apiService'; // Use the unified engine

/**
 * Get current user profile
 * Endpoint: GET /api/auth/me
 */
export const getProfile = async () => {
  // Token is automatically attached by the apiService interceptor
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update user profile
 * Endpoint: PUT /api/auth/update-profile
 */
export const updateProfile = async (userData) => {
  const response = await api.put('/auth/update-profile', userData);
  return response.data;
};

/**
 * Change password
 * Endpoint: POST /api/auth/change-password
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { 
    currentPassword, 
    newPassword 
  });
  return response.data;
};

