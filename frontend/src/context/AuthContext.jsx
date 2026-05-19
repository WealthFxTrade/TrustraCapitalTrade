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
import { setAuthToken, clearAuthToken } from '@/api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, loading: true };

    case 'SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        initialized: true,
        loading: false,
      };

    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        initialized: true,
        loading: false,
      };

    case 'INIT':
      return { ...state, initialized: true, loading: false };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const initLock = useRef(false);

  // Initialize Auth (Check existing session)
  const initAuth = useCallback(async () => {
    if (initLock.current) return;
    initLock.current = true;

    const token = localStorage.getItem('trustra_token') || sessionStorage.getItem('trustra_token');
    if (!token) {
      dispatch({ type: 'INIT' });
      initLock.current = false;
      return;
    }

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      const user = data?.user || data;

      if (user?._id || user?.id) {
        dispatch({ type: 'SUCCESS', payload: user });
      } else {
        clearAuthToken();
        dispatch({ type: 'LOGOUT' });
      }
    } catch (err) {
      clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'INIT' });
      initLock.current = false;
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ==================== MAIN LOGIN (ESTABLISH SESSION) ====================
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'START' });

    const toastId = toast.loading('Establishing secure encrypted session...');

    try {
      const { data } = await api.post(
        API_ENDPOINTS.AUTH.ESTABLISH_SESSION,   // ← Changed to new endpoint
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error('Invalid server response');
      }

      // Remember user by default (you can add rememberMe checkbox later)
      setAuthToken(token, true);

      dispatch({ type: 'SUCCESS', payload: user });

      toast.success('Access Granted. Welcome back.', { id: toastId });

      navigate('/dashboard', { replace: true });

      return { success: true, data };
    } catch (err) {
      console.error('Login Error:', err);

      clearAuthToken();
      dispatch({ type: 'LOGOUT' });

      const message = err?.response?.data?.message || err?.message || 'Invalid credentials';
      toast.error(message, { id: toastId });

      return { success: false, message };
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } finally {
      clearAuthToken();
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    }
  }, [navigate]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshSession: initAuth,
  }), [state, login, logout, initAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
