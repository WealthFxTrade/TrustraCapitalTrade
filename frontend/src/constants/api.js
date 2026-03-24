/** TRUSTRA CAPITAL TRADE API CONSTANTS **/

const ENV = import.meta.env.VITE_APP_ENV || 'development';

// Define the Base URL - defaults to Render for reliability
export const API_URL = (ENV === 'production')
  ? 'https://trustracapitaltrade-backend.onrender.com'
  : 'http://127.0.0.1:10000';

export const BASE_API_URL = API_URL;

// API Endpoints
// FIXED: Added '/api' prefix to match backend/server.js mounting
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/user/profile',
  },
  USER: {
    BALANCES: '/api/user/balances',
    TRANSACTIONS_RECENT: '/api/user/transactions/recent',
  },
};

export default { API_URL, BASE_API_URL, API_ENDPOINTS };

