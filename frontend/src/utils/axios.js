import axios from 'axios';

/**
 * PRODUCTION CONFIGURATION
 * Vercel automatically injects VITE_API_URL from your project settings.
 * Ensure there is no trailing slash in your Vercel Environment Variables.
 */
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'https://trustracapitaltrade-backend.onrender.com';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // CRITICAL: Allows secure cookies/sessions across domains
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15s timeout for slower Render free-tier wake-ups
});

// Attach Token for Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401, the "Failed to sync" error is triggered
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting...');
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

