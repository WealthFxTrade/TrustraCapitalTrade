import axios from 'axios';
import { API_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Injects the "Trustra Token" into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
