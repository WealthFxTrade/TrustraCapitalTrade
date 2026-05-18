// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api, { API_ENDPOINTS } from '@/api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true };

    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        isAuthenticated: true,
        initialized: true,
        loading: false,
      };

    case 'AUTH_LOGOUT':
    case 'AUTH_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        initialized: true,
        loading: false,
      };

    case 'SET_INITIALIZED':
      return { ...state, initialized: true, loading: false };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const isInitializing = useRef(false);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('trustra_token');
    localStorage.removeItem('trustra_remember');
    sessionStorage.removeItem('trustra_token');
  }, []);

  // Initialize Auth (Check existing token)
  const initAuth = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const token = localStorage.getItem('trustra_token') || sessionStorage.getItem('trustra_token');

    if (!token) {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);

      const user = data?.user || data?.data?.user || data;

      if (user?._id || user?.id) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      } else {
        clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.warn('Token validation failed');
      clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
    }
  }, [clearTokens]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ====================== LOGIN ======================
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    const toastId = toast.loading('Establishing secure encrypted session...');

    try {
      const payload = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);

      // Support multiple common response structures
      const user = data?.user || data?.data?.user || data?.payload?.user;
      const token = data?.token || data?.data?.token || data?.accessToken;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      // Store token
      if (credentials.rememberMe) {
        localStorage.setItem('trustra_token', token);
        localStorage.setItem('trustra_remember', 'true');
      } else {
        sessionStorage.setItem('trustra_token', token);
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      toast.success('Access Granted. Welcome back.', { id: toastId });

      return { success: true, user };

    } catch (error) {
      console.error('❌ Login Error:', error?.response?.data || error);

      dispatch({ type: 'AUTH_ERROR' });
      clearTokens();

      const serverMessage = error?.response?.data?.message || error?.message || 'Invalid credentials';

      // Better user messages
      let userMessage = serverMessage;
      if (serverMessage.toLowerCase().includes('verify')) {
        userMessage = 'Please verify your email address before logging in.';
      }

      toast.error(userMessage, { id: toastId });
      return { success: false, message: userMessage };
    }
  }, [clearTokens]);

  // ====================== SIGNUP ======================
  const signup = useCallback(async (payload) => {
    const toastId = toast.loading('Creating your account...');

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, payload);

      toast.success('Account created successfully! Please verify your email.', { id: toastId });
      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } catch (e) {}

    clearTokens();
    dispatch({ type: 'AUTH_LOGOUT' });
    navigate('/login', { replace: true });
    toast.success('Logged out successfully');
  }, [navigate, clearTokens]);

  const value = useMemo(() => ({
    ...state,
    login,
    signup,
    logout,
    refreshSession: initAuth,
  }), [state, login, signup, logout, initAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
