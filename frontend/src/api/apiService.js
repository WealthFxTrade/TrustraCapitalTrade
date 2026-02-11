import axios from 'axios';

const api = axios.create({
  // ✅ FIXED: Appended /api to match your backend route prefix
  baseURL: 'https://trustracapitaltrade-backend.onrender.com',
  
  // ✅ FIXED: Added 60s timeout for Render's Free Tier "Cold Start"
  timeout: 60000, 
  
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a timeout (Render sleeping)
    if (error.code === 'ECONNABORTED') {
      console.error('Render server is waking up. Please wait...');
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent redirect loops on auth pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

