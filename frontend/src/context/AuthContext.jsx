// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../constants/api';

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
        loading: false 
      };
    case 'AUTH_LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        initialized: true, 
        loading: false 
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

  // ── INITIAL AUTH CHECK ──
  const initAuth = useCallback(async () => {
    // Avoid double-initialization
    if (state.initialized || isInitializing.current) return;
    
    isInitializing.current = true;
    dispatch({ type: 'AUTH_START' });

    try {
      // This hits /auth/profile
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      
      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
      } else {
        // Server responded but user data was invalid/missing
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (err) {
      // Handled 401 (User Not Found) or 500 (Server Error)
      console.error("Auth System: Session invalid or user not found. Resetting state.");
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      isInitializing.current = false;
      // Failsafe: Always set initialized to true to stop any loading spinners
      dispatch({ type: 'SET_INITIALIZED' });
    }
  }, [state.initialized]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── LOGIN ACTION ──
  const login = async ({ email, password }) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      if (data?.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        return { success: true };
      }
      return { success: false, message: data?.message || 'Login failed' };
    } catch (err) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return { 
        success: false, 
        message: err.response?.data?.message || 'Invalid Credentials' 
      };
    }
  };

  // ── LOGOUT ACTION ──
  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.error("Logout error on server", err);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    ...state, 
    login, 
    logout,
    checkSession: initAuth // Allows manual session refresh if needed
  }), [state, logout, initAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

