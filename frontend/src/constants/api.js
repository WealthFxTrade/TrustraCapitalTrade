// Detect if running locally or on Render
export const API_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:10000/api'
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api');

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/me',
  },
  USER: {
    PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    KYC_SUBMIT: '/user/kyc-submit',
  },
  WITHDRAWAL: {
    REQUEST: '/withdrawal/request',
    MY_LIST: '/withdrawal/my',
  },
  ADMIN: {
    ACTIVITY: '/admin/activity',
    USERS: '/admin/users',
  }
};

// HELPER: Builds the full URL (e.g., http://localhost:10000/api/auth/login)
export function getApiUrl(endpoint) {
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanPath = endpoint.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}
