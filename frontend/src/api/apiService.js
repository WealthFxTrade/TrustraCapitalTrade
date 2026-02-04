import axios from 'axios';

// Ensure the URL is clean and includes /api
const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com";
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=expired';
      }
    }
    const normalizedError = {
      message: error.response?.data?.message || "Internal Server Error",
      status: error.response?.status || 500,
      success: false
    };
    return Promise.reject(normalizedError);
  }
);

export default api;

