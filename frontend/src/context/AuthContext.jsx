import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        initialized: true,
        loading: false,
        error: null,
      };
    case 'AUTH_CLEAR':
      return { ...state, user: null, isAuthenticated: false, initialized: true, loading: false, error: null };
    case 'AUTH_ERROR':
      return { ...state, loading: false, initialized: true, error: action.payload?.message };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  // ── Session Restoration (Run once on mount) ───────────────────────────────────
  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: data });
      } else {
        dispatch({ type: 'AUTH_CLEAR' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_CLEAR' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── Login Action ─────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      if (data?.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: data });
        return { success: true };
      }
      return { success: false, message: data?.message || 'Protocol rejection' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Zurich Mainnet Connection Error';
      dispatch({ type: 'AUTH_ERROR', payload: { message: msg } });
      return { success: false, message: msg };
    }
  };

  // ── Logout Action ────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway.');
    } finally {
      dispatch({ type: 'AUTH_CLEAR' });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAuth: initAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
