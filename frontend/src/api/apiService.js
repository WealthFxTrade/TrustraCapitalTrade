import axios from 'axios';

const api = axios.create({
  // Fallback to your production Render URL if env is missing
  baseURL: import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com",
  withCredentials: true
});

// REQUEST INTERCEPTOR: Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout user if token is expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic helper for functional components
export const request = async (url, method = 'GET', body = null) => {
  const response = await api({
    url,
    method,
    data: body
  });
  return response.data;
};

export default api;

