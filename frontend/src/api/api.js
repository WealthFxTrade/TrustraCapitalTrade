import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com/api',
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    nProgress.start();
    // Dynamically get the token before every request
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

api.interceptors.response.use(
  (response) => {
    nProgress.done();
    return response;
  },
  (error) => {
    nProgress.done();
    const status = error.response?.status;
    
    if (status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we aren't already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.data?.message) {
      // Show server error message if it exists
      toast.error(error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const submitKYC = async (formData) => {
  const response = await API.post('/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Admin Management Functions
export const fetchUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const distributeProfit = async (data) => {
  const response = await api.post('/admin/distribute-profit', data);
  return response.data;
};
