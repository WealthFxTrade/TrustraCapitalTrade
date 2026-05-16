// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '@/api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

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
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        initialized: true,
        loading: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        initialized: true,
        loading: false,
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false };
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

  const initAuth = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const token = localStorage.getItem('trustra_token') || sessionStorage.getItem('trustra_token');

    if (!token) {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
      return;
    }

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
      } else {
        clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
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

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    const toastId = toast.loading('Verifying credentials...');

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (data?.success && data?.token && data?.user) {
        const remember = credentials.rememberMe === true;

        if (remember) {
          localStorage.setItem('trustra_token', data.token);
          localStorage.setItem('trustra_remember', 'true');
        } else {
          sessionStorage.setItem('trustra_token', data.token);
        }

        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        toast.success('Access Granted', { id: toastId });
        return { success: true };
      }

      toast.error(data?.message || 'Invalid credentials', { id: toastId });
      return { success: false, message: data?.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or access token.';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } finally {
      clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    }
  }, [navigate, clearTokens]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
