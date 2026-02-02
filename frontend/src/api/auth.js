import { request } from './apiService';

/**                                                   
 * REGISTER
 * Creates user and saves session data
 */                                                  
export const register = async ({ fullName, email, password }) => {
  const data = await request('/auth/register', 'POST', { fullName, email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Store user object for Dashboard
  }
  return data;                                       
};

/**                                                   
 * LOGIN
 * Authenticates user and updates local session
 */
export const login = async ({ email, password }) => {
  const data = await request('/auth/login', 'POST', { email, password });                                   
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Critical for PrivateRoute role checks
  }                                                
  return data;
};                                                   

/**
 * FORGOT PASSWORD
 * Initiates the email recovery process
 */
export const forgotPassword = async (email) => {
  return await request('/auth/forgot-password', 'POST', { email });                                       
};

/**
 * RESET PASSWORD
 * Updates password using the token sent to email
 */
export const resetPassword = async (token, password) => {
  return await request(`/auth/reset-password/${token}`, 'POST', { password });                            
};

/**                                                   
 * LOGOUT
 * Full session cleanup
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

