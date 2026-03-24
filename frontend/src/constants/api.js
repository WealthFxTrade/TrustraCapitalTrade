/** TRUSTRA CAPITAL TRADE API CONSTANTS **/

const ENV = import.meta.env.VITE_APP_ENV || 'development';

export const API_URL = import.meta.env.VITE_API_URL || (
  ENV === 'production'
    ? 'https://trustracapitaltrade-backend.onrender.com'
    : 'http://127.0.0.1:10000'
);

export const BASE_API_URL = API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/user/profile',
  },
  USER: {
    BALANCES: '/user/balances',
    TRANSACTIONS_RECENT: '/user/transactions/recent',
  },
};

export default { API_URL, BASE_API_URL, API_ENDPOINTS };
