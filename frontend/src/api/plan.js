import api from './apiService'; // Use the unified production engine

/**
 * Fetch all available investment plans
 * Endpoint: GET /api/plan
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export const fetchPlans = async () => {
  try {
    // Hits: https://trustracapitaltrade-backend.onrender.com
    const response = await api.get('/plan');
    return response.data; 
  } catch (err) {
    console.error('⚠️ Plan Fetch Error:', err.message);
    return {
      success: false,
      count: 0,
      data: [],
      message: err.message || 'Failed to fetch investment plans',
    };
  }
};

/**
 * Fetch a specific plan by its ID
 * Endpoint: GET /api/plan/:id
 * @param {string} id
 */
export const fetchPlanById = async (id) => {
  try {
    const response = await api.get(`/plan/${id}`);
    return response.data;
  } catch (err) {
    console.error(`⚠️ Error fetching plan ${id}:`, err.message);
    return {
      success: false,
      data: null,
      message: err.message || 'Failed to fetch specific plan',
    };
  }
};

