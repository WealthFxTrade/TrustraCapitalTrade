// constants/api.js
export const API_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:10000/api'
  : '/api'; // In production, Vercel proxies /api to your Render URL

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  USER: {
    DASHBOARD: '/user/dashboard',
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
  WITHDRAWAL: {
    REQUEST: '/withdrawal/request',
    HISTORY: '/withdrawal/history',
  },
  ADMIN: {
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    UPDATE_BALANCE: '/admin/user', 
  }
};

/**
 * HELPER: Construct full URLs if needed outside the Axios instance
 */
export function getApiUrl(endpoint) {
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanPath = endpoint.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}
