import api from "./apiService";

/**
 * Fetch all available investment plans
 * Endpoint: GET /api/plan
 */
export const fetchPlans = async () => {
  try {
    const res = await api.get("/plan");
    return res.data; // { success, count, data }
  } catch (err) {
    console.error("⚠️ Plan Fetch Error:", err.message);
    return { success: false, count: 0, data: [], message: err.message || "Failed to fetch plans" };
  }
};

/**
 * Fetch specific plan by ID
 * Endpoint: GET /api/plan/:id
 */
export const fetchPlanById = async (id) => {
  try {
    const res = await api.get(`/plan/${id}`);
    return res.data;
  } catch (err) {
    console.error(`⚠️ Fetch Plan ${id} Error:`, err.message);
    return { success: false, data: null, message: err.message || "Failed to fetch plan" };
  }
};
