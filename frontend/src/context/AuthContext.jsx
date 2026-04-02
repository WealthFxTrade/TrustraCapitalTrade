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

  // ── Initialize session
  const initAuth = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch {
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'SET_INITIALIZED' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── Login
  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      if (data?.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        return { success: true };
      }
      return { success: false, message: data?.message || 'Invalid Credentials' };
    } catch (err) {
      dispatch({ type: 'SET_INITIALIZED' });
      return { success: false, message: err.response?.data?.message || 'Terminal connection failure' };
    }
  };

  // ── Logout
  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      console.warn("Session: Local termination enforced.");
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ── Context value
  const authValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshSession: initAuth
  }), [state, logout, initAuth]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be utilized within an AuthProvider node.");
  return context;
};
