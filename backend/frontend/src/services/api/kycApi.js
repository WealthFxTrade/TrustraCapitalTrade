// src/services/api/kycApi.js
import axios from './axios'; // your custom axios instance (with baseURL + interceptors)

// Optional: Add types if using TypeScript
// interface KycSubmission { ... }

/**
 * Fetch KYC submissions (filtered by status)
 * @param {string} [status='pending'] - 'pending' | 'approved' | 'rejected' | 'all'
 * @returns {Promise<{ success: boolean, data: KycSubmission[], count: number, ... }>}
 */
export const fetchKyc = async (status = 'pending') => {
  try {
    const response = await axios.get('/admin/kyc', {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    throw error.response?.data || {
      success: false,
      message: error.message || 'Failed to load KYC submissions',
    };
  }
};

/**
 * Approve a KYC submission
 * @param {string} id - KYC document ID
 * @returns {Promise<{ success: boolean, message: string, kyc: object }>}
 */
export const approveKyc = async (id) => {
  if (!id) throw new Error('KYC ID is required');

  try {
    const response = await axios.patch(`/admin/kyc/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving KYC ${id}:`, error);
    throw error.response?.data || {
      success: false,
      message: error.message || 'Failed to approve KYC',
    };
  }
};

/**
 * Reject a KYC submission with reason
 * @param {string} id - KYC document ID
 * @param {string} reason - Rejection reason (required)
 * @returns {Promise<{ success: boolean, message: string, kyc: object }>}
 */
export const rejectKyc = async (id, reason) => {
  if (!id) throw new Error('KYC ID is required');
  if (!reason || reason.trim().length < 5) {
    throw new Error('Rejection reason must be provided and meaningful');
  }

  try {
    const response = await axios.patch(`/admin/kyc/${id}/reject`, {
      reason: reason.trim(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting KYC ${id}:`, error);
    throw error.response?.data || {
      success: false,
      message: error.message || 'Failed to reject KYC',
    };
  }
};

/**
 * Optional: Get single KYC detail (useful for modal or detail page)
 * @param {string} id - KYC document ID
 */
export const getKycDetail = async (id) => {
  try {
    const response = await axios.get(`/admin/kyc/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching KYC detail ${id}:`, error);
    throw error.response?.data || {
      success: false,
      message: 'Failed to load KYC details',
    };
  }
};

// Export as named object (cleaner import)
export const kycApi = {
  fetchKyc,
  approveKyc,
  rejectKyc,
  getKycDetail,
};
