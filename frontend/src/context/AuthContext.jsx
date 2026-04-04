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
      return {
        ...state,
        loading: false,
        initialized: true,
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

  // Initialize auth session
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
    } catch (error) {
      console.log('No active session');
      dispatch({ type: 'AUTH_LOGOUT' });
    } finally {
      dispatch({ type: 'SET_INITIALIZED' });
      isInitializing.current = false;
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login
  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        return { success: true, user: data.user };
      }

      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, message: data?.message || 'Login failed' };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = error.response?.data?.message || error.message || 'Connection failed';
      return { success: false, message };
    }
  };

  // Signup
  const signup = async (userData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.SIGNUP, {
        name: userData.name,
        email: userData.email.trim(),
        password: userData.password,
        activePlan: userData.activePlan,
      });

      if (data?.success && data?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
        return { success: true, user: data.user };
      }

      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, message: data?.message || 'Registration failed' };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.trim(),
      });
      return { success: true, message: data?.message || 'Recovery email sent' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send recovery email';
      return { success: false, message };
    }
  };

  // Reset Password
  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });
      return { success: true, message: data?.message || 'Password reset successful' };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return { success: false, message };
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API failed, clearing local session');
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

  const authValue = useMemo(() => ({
    ...state,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    refreshSession: initAuth,
  }), [state, logout, initAuth]);

  return (
    <AuthContext.Provider value={authValue}>
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
