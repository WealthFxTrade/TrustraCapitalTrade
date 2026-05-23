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

  // Initialize Auth - Check for existing valid session
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

  // ==================== LOGIN ====================
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'START' });

    const toastId = toast.loading('Establishing secure encrypted session...');

    try {
      const { data } = await api.post(
        API_ENDPOINTS.AUTH.ESTABLISH_SESSION,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          timeout: 90000,
          signal: credentials.signal,
        }
      );

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error('Invalid server response');
      }

      setAuthToken(token, true);

      dispatch({ type: 'SUCCESS', payload: user });

      toast.success('Access Granted. Welcome back.', { id: toastId });

      navigate('/dashboard', { replace: true });

      return { success: true, data };
    } catch (err) {
      console.error('Login Error:', err);

      clearAuthToken();
      dispatch({ type: 'LOGOUT' });

      let message = 'Invalid credentials';

      if (err.name === 'AbortError' || err.message?.toLowerCase().includes('timeout')) {
        message = 'Request timeout. Please check your connection and try again.';
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      toast.error(message, { id: toastId });

      return { success: false, message };
    }
  }, [navigate]);

  // ==================== SIGNUP / REGISTER ====================
  const signup = useCallback(async (userData, signal) => {
    dispatch({ type: 'START' });

    const toastId = toast.loading('Creating your account...');

    try {
      const { data } = await api.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        {
          timeout: 60000,
          signal: signal,
        }
      );

      const token = data?.token;
      const user = data?.user;

      if (token && user) {
        setAuthToken(token, true);
        dispatch({ type: 'SUCCESS', payload: user });
        toast.success('Account created successfully!', { id: toastId });
        navigate('/dashboard', { replace: true });
      } else {
        toast.success('Account created successfully! Please log in.', { id: toastId });
      }

      return { success: true, data };
    } catch (err) {
      console.error('Signup Error:', err);

      let message = 'Registration failed. Please try again.';

      if (err.name === 'AbortError' || err.message?.includes('timeout')) {
        message = 'Request timeout. Please try again.';
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      toast.error(message, { id: toastId });
      dispatch({ type: 'LOGOUT' });

      return { success: false, message };
    }
  }, [navigate]);

  // ==================== LOGOUT ====================
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
    signup,           // ← Added
    logout,
    refreshSession: initAuth,
  }), [state, login, signup, logout, initAuth]);

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
