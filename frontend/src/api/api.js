import axios from 'axios';

const TOKEN_KEY = 'trustra_token';

// HANDSHAKE LOGIC: 
// In development, we use '/api' to trigger the Vite Proxy.
// In production, we use the live Render URL.
const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com');

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR: Inject the Secure Cipher (Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Handle Authentication Failures (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Optional: Redirect to login terminal if unauthorized
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/** --- PROTOCOL EXPORTS --- **/

export const fetchUserProfile = async () => {
  const { data } = await api.get('/user/profile');
  return data;
};

export const fetchUsers = async () => {
  const { data } = await api.get('/user/all');
  return data;
};

export const submitKYC = async (formData) => {
  // Multimodal submission (Files + Data)
  const { data } = await api.post('/user/kyc-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export default api;

