import axios from 'axios';

const api = axios.create({
  // FIX: Added /api to the end of the URL to match backend app.use('/api/...')
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // Ensure this matches your login storage key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;

