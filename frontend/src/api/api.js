import axios from 'axios';
import { BASE_API_URL } from '../constants/api'; // e.g. 'http://localhost:10000/api'

// ────────────────────────────────────────────────────────────────
// TRUSTRA API CLIENT – Zurich Mainnet v25.3.0
// ────────────────────────────────────────────────────────────────
// Strategy: httpOnly secure cookies for auth (no localStorage token)
//           withCredentials: true → browser sends cookies automatically
//           No manual Authorization header needed anymore
// ────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 seconds – adjust via env if needed
  withCredentials: true, // CRITICAL: Allows browser to send/receive httpOnly cookies
});

// ── REQUEST INTERCEPTOR ──
// No longer attach Bearer token — backend sets/trusts httpOnly cookie
api.interceptors.request.use(
  (config) => {
    // Optional: add custom headers or debug logging
    // config.headers['X-Custom-Header'] = 'Trustra-Client';
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──
// Handles global errors, auto-logout on 401/403, detailed console logging
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    // Detailed debug log for developers
    console.error('API Request Failed:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: status || 'No response',
      message: error.response?.data?.message || error.message,
      responseData: error.response?.data,
      isNetworkError: !error.response && !!error.request,
    });

    // Auto-logout on auth failure
    if (status === 401 || status === 403) {
      console.warn('Auth token invalid/expired → logging out');
      // No localStorage token to clear anymore (cookies are httpOnly)
      // Redirect to login (uncomment if needed)
      // window.location.href = '/login';
    }

    // Optional: show toast globally for certain errors (if not handled in component)
    // if (status >= 500) toast.error('Server error – please try again later');

    return Promise.reject(error);
  }
);

export default api;
