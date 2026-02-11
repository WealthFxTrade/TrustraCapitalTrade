import axios from 'axios';

const api = axios.create({
  // ✅ PRODUCTION URL: Matches your Render deployment
  baseURL: 'https://trustracapitaltrade-backend.onrender.com', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout for Render cold starts
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    // ✅ SYNCED KEY: Matches your Login/AuthContext storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); 
    
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add Response Interceptor to handle 401s (Expired Tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

