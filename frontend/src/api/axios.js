import axios from 'axios';
import { getAccessToken, setAccessToken } from './tokenService';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  withCredentials: true, // required to send HttpOnly cookies
  timeout: 15000,        // 15s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach in-memory access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // in-memory token only
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network or CORS errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({ message: 'Network error. Please try again.' });
    }

    // Handle expired access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request new access token using refresh token cookie
        const { data } = await axios.post(
          '/auth/refresh', 
          {}, 
          {
            baseURL: api.defaults.baseURL,
            withCredentials: true,
          }
        );

        // Store new token in memory
        setAccessToken(data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → force logout
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Other API errors
    const message = error.response.data?.message || 'Unexpected API error';
    return Promise.reject({ ...error.response.data, message });
  }
);

export default api;
