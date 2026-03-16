// src/context/AuthContext.jsx
// Authentication state management for the entire application
// Uses React Context + useReducer to handle login, signup, logout, session restore

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { useNavigate } from 'react-router-dom';

import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

// ── Create the Context object ────────────────────────────────────────────────────────
// This is what components will consume via useAuth()
const AuthContext = createContext();

// ── Initial state for the auth reducer ───────────────────────────────────────────────
const initialState = {
  user: null,               // Current authenticated user object
  isAuthenticated: false,   // Quick boolean flag for protected routes
  initialized: false,       // Prevents multiple init calls & shows loading
  loading: false,           // Global loading state during auth operations
  error: null,              // Last authentication error message
};

// ── Reducer function – pure state transitions ────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      // Begin any auth operation (login, signup, profile check)
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      // Successful authentication or session restore
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        initialized: true,
        loading: false,
        error: null,
      };

    case 'AUTH_CLEAR':
      // Logout or failed session restore
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        initialized: true,
        loading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      // Authentication failed (wrong credentials, network error, etc.)
      return {
        ...state,
        loading: false,
        initialized: true,
        error: action.payload?.message || 'Authentication failed',
      };

    default:
      return state;
  }
}

// ── Main Auth Provider component – wraps the entire app ──────────────────────────────
export function AuthProvider({ children }) {
  // Use reducer to manage auth state
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Used to navigate after login/logout
  const navigate = useNavigate();

  // Prevent multiple simultaneous initialization attempts
  const isInitializing = useRef(false);

  // ── Initialize / Restore user session on app mount ────────────────────────────────
  const initAuth = useCallback(async () => {
    // Guard against duplicate calls
    if (isInitializing.current || state.initialized) {
      return;
    }

    isInitializing.current = true;
    dispatch({ type: 'AUTH_START' });

    // Safety timeout – prevents hanging if backend is unreachable
    const timeoutId = setTimeout(() => {
      if (!state.initialized) {
        console.warn('[AUTH] Initialization timeout – forcing public state');
        dispatch({ type: 'AUTH_CLEAR' });
      }
    }, 7000);

    try {
      // Attempt to fetch current user profile
      // Cookie (trustra_token) is sent automatically via withCredentials: true
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);

      clearTimeout(timeoutId);

      if (data?.success && data.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user },
        });
      } else {
        dispatch({ type: 'AUTH_CLEAR' });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[AUTH] Profile check failed:', error.message);
      dispatch({ type: 'AUTH_CLEAR' });
    } finally {
      isInitializing.current = false;
    }
  }, [state.initialized]);

  // Run initialization once when provider mounts
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── Login function – authenticates user and sets session ──────────────────────────
  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Send login request – backend sets httpOnly cookie on success
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

      if (!data.success || !data.user) {
        throw new Error(data.message || 'Login unsuccessful');
      }

      // No token to save manually – cookie is already set by backend
      // Refresh auth state (fetch profile to confirm)
      await initAuth();

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Invalid credentials or server error';

      dispatch({ type: 'AUTH_ERROR', payload: { message } });
      throw new Error(message);
    }
  };

  // ── Signup function – creates user and auto-logs in ───────────────────────────────
  const signup = async (userData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Backend likely auto-logs in → refresh auth state
      await initAuth();

      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed';

      dispatch({ type: 'AUTH_ERROR', payload: { message } });
      throw new Error(message);
    }
  };

  // ── Logout – clears session and redirects to login ────────────────────────────────
  const logout = async () => {
    try {
      // Tell backend to clear cookie
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.warn('[AUTH] Backend logout failed – clearing locally only');
    } finally {
      // Clear local state and redirect
      dispatch({ type: 'AUTH_CLEAR' });
      navigate('/login', { replace: true });
    }
  };

  // ── Manual refresh of auth state (useful after profile updates) ───────────────────
  const refreshAuth = () => initAuth();

  // Provide state and methods to all children
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook to use auth context anywhere in the app ─────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
