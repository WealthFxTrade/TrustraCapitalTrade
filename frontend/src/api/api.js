import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css'; // Don't forget to import the CSS!

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api',
  withCredentials: true,
  timeout: 30000,
});

// 1. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    nProgress.start(); // Start the top loading bar
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    nProgress.done();
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    nProgress.done(); // Stop the loading bar
    return response;
  },
  (error) => {
    nProgress.done();
    
    const status = error.response?.status;
    const message = error.response?.data?.message || "Network Error";

    // Auto-Logout on 401
    if (status === 401) {
      localStorage.clear(); // Clear all to be safe
      if (window.location.pathname !== '/login') {
        toast.error("Session expired. Please log in again.");
        window.location.href = '/login';
      }
    } 
    
    // Global Error Toasting (Optional: avoids repeating toast.error in every component)
    else if (status >= 500) {
      toast.error("Server error. Our engineers are on it.");
    }

    return Promise.reject(error);
  }
);

export default api;
