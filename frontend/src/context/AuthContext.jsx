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

import api, { API_ENDPOINTS, setAuthToken, clearAuthToken } from '@/api/api';

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

  const initAuth = useCallback(async () => {
    if (initLock.current) return;
    initLock.current = true;

    const token =
      localStorage.getItem('trustra_token') ||
      sessionStorage.getItem('trustra_token');

    if (!token) {
      dispatch({ type: 'INIT' });
      initLock.current = false;
      return;
    }

    setAuthToken(token);

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);

      const user = data?.user || data;

      if (user?.id || user?._id) {
        dispatch({ type: 'SUCCESS', payload: user });
      } else {
        clearAuthToken();
        dispatch({ type: 'LOGOUT' });
      }
    } catch {
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

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'START' });

    const toastId = toast.loading('Authenticating...');

    try {
      const { data } = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) throw new Error('Invalid response');

      setAuthToken(token, credentials.rememberMe);

      dispatch({ type: 'SUCCESS', payload: user });

      toast.success('Welcome back', { id: toastId });

      navigate('/dashboard');

      return { success: true };
    } catch (err) {
      clearAuthToken();
      dispatch({ type: 'LOGOUT' });

      toast.error(err?.message || 'Login failed', { id: toastId });

      return { success: false };
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {}

    clearAuthToken();
    dispatch({ type: 'LOGOUT' });

    navigate('/login');
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
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
};
