// src/api/api.js
const API_URL = 'https://trustracapitaltrade-backend.onrender.com/api';

export const request = async (endpoint, method = 'GET', body = null, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (err) {
    console.error(`[API ERROR] ${method} ${endpoint}:`, err.message);
    throw err;
  }
};
