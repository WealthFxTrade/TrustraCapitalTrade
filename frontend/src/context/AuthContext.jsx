import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api'; // your axios instance

const AuthContext = createContext(null);

export const TOKEN_KEY = 'trustra_token';

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: true,
  initialized: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        initialized: true,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
        error: null,
      };
    case 'AUTH_INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        initialized: true,
        error: null,
      };
    case 'AUTH_FAILURE':
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        initialized: true,
        error: action.payload,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem(TOKEN_KEY, data.token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: data.token },
      });

      return data;
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials or network.';
      dispatch({ type: 'SET_ERROR', payload: errMsg });
      throw error; // allow Login component to show toast
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isPublicPage = ['/login', '/register', '/'].includes(pathname);

    if (!token) {
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      if (!isPublicPage) {
        navigate('/login', { replace: true });
      }
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await api.get('/user/profile');
      dispatch({
        type: 'AUTH_INIT_SUCCESS',
        payload: { user: data.user || data },
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      const errMsg =
        error.response?.status === 401
          ? 'Session expired. Please sign in again.'
          : 'Failed to verify session. Logging out...';
      dispatch({ type: 'SET_ERROR', payload: errMsg });
      logout();
    }
  }, [pathname, navigate, logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Optional: refresh token or auto-logout on expiry can be added here later

  if (state.loading && !state.initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        dispatch, // if needed for rare manual state updates
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
