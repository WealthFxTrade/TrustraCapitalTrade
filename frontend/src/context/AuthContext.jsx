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
      return {
        ...state,
        loading: true,
      };

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
      return {
        ...state,
        initialized: true,
        loading: false,
      };

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

    const token =
      localStorage.getItem('trustra_token') ||
      sessionStorage.getItem('trustra_token');

    if (!token) {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);

      const user =
        data?.user ||
        data?.data?.user ||
        data;

      if (user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user },
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ==================== IMPROVED LOGIN FUNCTION ====================
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });

    const toastId = toast.loading('Signing in...');

    try {
      // Debug logs for production troubleshooting
      console.log('🚀 Login Attempt Started');
      console.log('📍 Environment Mode:', import.meta.env.MODE);
      console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('📧 Email:', credentials.email.trim().toLowerCase());

      const { data } = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }
      );

      console.log('✅ Login Response Received:', data);

      const user = data?.user || data?.data?.user;
      const token = data?.token;

      if (!user) {
        dispatch({ type: 'AUTH_ERROR' });
        toast.error('Login failed - No user returned', { id: toastId });
        return { success: false };
      }

      if (token) {
        if (credentials.rememberMe) {
          localStorage.setItem('trustra_token', token);
          localStorage.setItem('trustra_remember', 'true');
        } else {
          sessionStorage.setItem('trustra_token', token);
        }
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user },
      });

      dispatch({ type: 'SET_INITIALIZED' });

      toast.success('Login successful', { id: toastId });
      return { success: true };

    } catch (error) {
      console.error('❌ Login Error Details:', {
        status: error?.response?.status,
        message: error?.response?.data?.message,
        fullError: error?.response?.data
      });

      dispatch({ type: 'AUTH_ERROR' });

      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Invalid credentials';

      toast.error(errorMsg, { id: toastId });
      return { success: false };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      console.warn('Logout API call failed, clearing local tokens anyway');
    }

    clearTokens();

    dispatch({ type: 'AUTH_LOGOUT' });
    dispatch({ type: 'SET_INITIALIZED' });

    navigate('/login', { replace: true });

    toast.success('Logged out');
  }, [navigate, clearTokens]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshSession: initAuth,
    }),
    [state, login, logout, initAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
