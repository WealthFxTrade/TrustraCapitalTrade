import axios from 'axios';
import nProgress from 'nprogress';
import { toast } from 'react-hot-toast';
import 'nprogress/nprogress.css';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://trustracapitaltrade-backend.onrender.com/api',
  withCredentials: true,
  timeout: 30000,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    nProgress.start();

    // Always pull fresh token
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

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    nProgress.done();
    return response;
  },
  (error) => {
    nProgress.done();

    const status = error.response?.status;

    // 🔥 DO NOT HARD REDIRECT HERE
    // Let AuthContext handle navigation
    if (status === 401) {
      localStorage.removeItem('token');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;

/* =========================
   FEATURED API FUNCTIONS
========================= */

export const submitKYC = async (formData) => {
  const response = await api.post('/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/* =========================
   ADMIN FUNCTIONS
========================= */

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
