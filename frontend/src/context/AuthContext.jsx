// src/context/AuthContext.jsx - FULL CLEAN VERSION

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
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        initialized: true,
        loading: false,
        error: null,
      };

    case 'AUTH_ERROR':
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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      console.log('[AUTH] Token saved successfully');
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      console.log('[AUTH] Token cleared');
    }
  };

  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    dispatch({ type: 'AUTH_START' });

    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'AUTH_CLEAR' });
      return;
    }

    setAuthToken(token);

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);

      if (data?.success && data?.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user },
        });
      } else {
        setAuthToken(null);
        dispatch({ type: 'AUTH_CLEAR' });
      }
    } catch (error) {
      console.error('[AUTH INIT ERROR]', error);
      setAuthToken(null);
      dispatch({ type: 'AUTH_CLEAR' });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

      if (data?.success && data?.token) {
        setAuthToken(data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user || { email: credentials.email } },
        });
        return { success: true };
      }

      return {
        success: false,
        message: data?.message || 'Authentication failed',
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      dispatch({
        type: 'AUTH_ERROR',
        payload: { message: msg },
      });
      return { success: false, message: msg };
    }
  };

  const logout = useCallback(async () => {
    setAuthToken(null);
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
