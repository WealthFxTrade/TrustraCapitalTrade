import axios from 'axios';

/**
 * 🌍 VITE ENVIRONMENT VARIABLE CONFIGURATION
 * import.meta.env.VITE_API_URL will be:
 * https://trustracapitaltrade-backend.onrender.com/api
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://172.20.10.2:10000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🛡️ Required for cookies/sessions across domains
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

/**
 * 🚀 REQUEST INTERCEPTOR
 * You can use this to inject tokens or log outgoing requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add logic here if you need to attach headers dynamically
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

