// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '@/api/api';

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

  // Helper to clear all fallback browser tokens cleanly
  const clearTokens = useCallback(() => {
    localStorage.removeItem('trustra_token');
    localStorage.removeItem('trustra_remember');
    sessionStorage.removeItem('trustra_token');
  }, []);

  // Initialize auth session on app load
  const initAuth = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    // Dual fallbacks: Support local dev environment configurations alongside secure cross-origin cookies
    const token = localStorage.getItem('trustra_token') ||
                 sessionStorage.getItem('trustra_token');

    // If no explicit tracking tokens exist, immediately set initialization complete and stop execution
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
      console.error('Trustra platform session validation failed:', error);
      clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      // PRODUCTION FIX: Single consolidated checkpoint to prevent dispatch cycle collisions
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
    }
  }, [clearTokens]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login Function
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (data?.success && data?.user) {
        // Handle "Remember Me" data configurations
        const remember = credentials.remember === true;
        
        // PRODUCTION FIX: Ensure storage write blocks execute completely 
        // before dispatching success notifications to avoid race conditions with interceptors
        if (remember) {
          localStorage.setItem('trustra_remember', 'true');
          localStorage.setItem('trustra_token', data.token);
        } else {
          sessionStorage.setItem('trustra_token', data.token);
        }

        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        return { success: true };
      }

      dispatch({ type: 'AUTH_ERROR' });
      return {
        success: false,
        message: data?.message || 'Invalid credentials.'
      };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or access token.'
      };
    }
  }, []);

  // Logout Function
  const logout = useCallback(async () => {
    try {
      // Wipes cookies directly on the backend infrastructure nodes
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
        console.warn("Backend cookie termination unreachable, flushing local storage");
      });
    } catch (err) {
      console.warn("Logout request dropped due to unexpected transport failure.");
    } finally {
      // Flush client data vectors completely
      clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login', { replace: true });
    }
  }, [navigate, clearTokens]);

  const refreshSession = useCallback(() => initAuth(), [initAuth]);

  const authValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshSession,
  }), [state, login, logout, refreshSession]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

