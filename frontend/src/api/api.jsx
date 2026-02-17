import axios from 'axios';

export const getAccessToken = () => localStorage.getItem('token');

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const api = axios.create({
  // Use the Vercel env var, or fallback to the full Render API path
  baseURL: import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Render 'Cold Start' (No response for 30s)
    if (!error.response) {
      return Promise.reject(new Error('Backend is waking up. Please wait 30 seconds and try again.'));
    }

    // Handle Token Expiry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post('/auth/refresh', {}, {
          baseURL: api.defaults.baseURL,
          withCredentials: true
        });
        const newToken = refreshRes.data?.accessToken || refreshRes.data?.token;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }

    const message = error.response?.data?.message || 'Action failed';
    return Promise.reject(new Error(message));
  }
);

export default api;

