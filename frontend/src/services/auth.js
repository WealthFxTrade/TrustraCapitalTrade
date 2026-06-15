// src/services/auth.js
import { getApiBaseUrl, API_ENDPOINTS } from '@/constants/api';

/**
 * Unified API fetch helper
 */
const apiFetch = async (endpoint, options = {}) => {
  const baseURL = getApiBaseUrl();
  const url = `\( {baseURL} \){endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Request failed');
  }

  return await response.json();
};

/* ====================== AUTH SERVICES ====================== */

export async function signup(name, email, password) {
  return apiFetch(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email, password) {
  return apiFetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Keep this for compatibility with your main login flow if needed
export async function establishSession(email, password) {
  return apiFetch(API_ENDPOINTS.AUTH.ESTABLISH_SESSION, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function authorizeSession(email) {
  return apiFetch(API_ENDPOINTS.AUTH.AUTHORIZE_SESSION, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  return apiFetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
}
