import api from './apiService';

/**                                               
 * REGISTER
 */
export const register = async ({ fullName, email, password }) => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return response.data;
};

/**                                               
 * LOGIN - FIXED: Now saves the token for the interceptor
 */
export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  
  // CRITICAL: Save the token so apiService.js can grab it for the next request
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
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
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

