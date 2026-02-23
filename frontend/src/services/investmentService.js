// src/services/investmentService.js
import api from '../api/api.js'; // your configured Axios instance

/**
 * Fetch all available investment nodes
 * @returns {Promise<Array>} Array of nodes
 */
export const getInvestmentNodes = async () => {
  try {
    const response = await api.get('/invest/nodes');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch investment nodes:', error);
    throw error;
  }
};

/**
 * Join a specific investment node
 * @param {string} nodeId - ID of the investment node
 * @param {number} amount - Amount to invest
 * @returns {Promise<Object>} Investment result
 */
export const joinInvestmentNode = async (nodeId, amount) => {
  try {
    const response = await api.post(`/invest/join`, {
      nodeId,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to join investment node:', error);
    throw error;
  }
};

/**
 * Get user's active investments
 * @returns {Promise<Array>} List of user investments
 */
export const getUserInvestments = async () => {
  try {
    const response = await api.get('/invest/my');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user investments:', error);
    throw error;
  }
};

/**
 * Withdraw from an investment node
 * @param {string} investmentId - User's investment ID
 * @returns {Promise<Object>} Withdrawal result
 */
export const withdrawInvestment = async (investmentId) => {
  try {
    const response = await api.post(`/invest/withdraw`, { investmentId });
    return response.data;
  } catch (error) {
    console.error('Failed to withdraw investment:', error);
    throw error;
  }
};
