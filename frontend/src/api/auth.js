import api from './apiService';

/**                                                  
 * REGISTER
 * Sends data to /api/auth/register
 */
export const register = async ({ fullName, email, password }) => {
  // api instance already handles baseURL and /api prefix
  const response = await api.post('/auth/register', { fullName, email, password });
  
  // Note: LocalStorage is handled by Login.jsx or AuthContext.jsx 
  // to keep the UI in sync, but we return the data here.
  return response.data;
};

/**                                                  
 * LOGIN
 * Sends data to /api/auth/login
 */
export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * FORGOT PASSWORD
 * Sends data to /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * RESET PASSWORD
 * Sends data to /api/auth/reset-password/:token
 */
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

/**                                                  
 * LOGOUT
 * Standardized cleanup for production
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Use location.replace to prevent back-button access to protected pages
  window.location.replace('/login');
};

