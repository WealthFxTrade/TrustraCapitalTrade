// api/adminDashboard.js   (or wherever you keep your API functions)
import axios from './axios';  // your configured axios instance

/**
 * Fetch admin dashboard statistics
 * @param {Object} [config] - Optional axios config (e.g. { signal } for abort)
 * @returns {Promise<Object>} - The stats response data
 * @throws {Error} - If request fails (with meaningful message)
 */
export const fetchAdminStats = async (config = {}) => {
  try {
    const response = await axios.get('/admin/dashboard/stats', {
      ...config,
      // Optional: you can force fresh data or add params if needed later
      // params: { refresh: true },
    });

    // Optional: validate response shape (defensive programming)
    if (!response.data?.success || !response.data?.data) {
      throw new Error('Invalid response format from admin stats endpoint');
    }

    return response.data.data; // return the useful part directly
  } catch (error) {
    // Improve error handling for better UX/debugging
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch admin statistics';

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.code = error.code;
    enhancedError.isAxiosError = error.isAxiosError;

    throw enhancedError;
  }
};
