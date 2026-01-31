const BASE_URL = 'https://trustracapitaltrade-backend.onrender.com/api';

// Helper: build headers with auth token
function getHeaders(isJson = true) {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// Generic fetch helper
async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null); // fallback if no JSON
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data;
}

// ───────────── API Methods ─────────────

export function apiGet(endpoint) {
  return request(endpoint, { headers: getHeaders(false) });
}

export function apiPost(endpoint, body) {
  return request(endpoint, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
}

export function apiPut(endpoint, body) {
  return request(endpoint, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
}

export function apiDelete(endpoint) {
  return request(endpoint, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
}
