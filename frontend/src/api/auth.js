// src/api/auth.js
import api from '../constants/api';   // assuming this exports the axios instance

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (fullName, email, password, phone) => {
  const { data } = await api.post('/auth/register', { 
    fullName, 
    email, 
    password, 
    phone 
  });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};
