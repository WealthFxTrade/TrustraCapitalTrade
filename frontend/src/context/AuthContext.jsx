// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Add for SPA navigation
import api, { setAccessToken } from '../api/api'; // Assume your API client

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        initialized: true,
        error: null,
      };
    case 'AUTH_FAILED':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
        error: action.payload?.message || 'Authentication failed',
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
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Token refresh logic (optional enhancement)
  const refreshToken = useCallback(async () => {
    try {
      const refreshRes = await api.post('/auth/refresh');
      const { token, refreshToken: newRefresh } = refreshRes.data;
      localStorage.setItem('token', token);
      if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
      setAccessToken(token);
      return token;
    } catch (err) {
      return null;
    }
  }, []);

  const initAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED', payload: { message: 'No token found' } });
      return;
    }

    setAccessToken(storedToken);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Try refresh first if token might be expired
      let currentToken = storedToken;
      if (localStorage.getItem('refreshToken')) {
        currentToken = await refreshToken() || storedToken;
      }

      const res = await api.get('/auth/profile');
      const userData = res.data.user || res.data;
      dispatch({
        type: 'LOGIN',
        payload: { user: userData, token: currentToken },
      });
    } catch (err) {
      console.error('[Auth] Initialization failed:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        dispatch({
          type: 'AUTH_FAILED',
          payload: { message: 'Session expired. Please log in again.' },
        });
        navigate('/login', { replace: true });
      } else {
        dispatch({
          type: 'AUTH_FAILED',
          payload: { message: 'Network or server error. Please try again.' },
        });
      }
    }
  }, [navigate, refreshToken]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback((user, token) => {
    if (!token) return;
    localStorage.setItem('token', token);
    setAccessToken(token);
    dispatch({
      type: 'LOGIN',
      payload: { user, token },
    });
    navigate('/dashboard', { replace: true }); // Redirect after login
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const isReady = state.initialized && !state.loading;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isReady }}>
      {!isReady ? (
        <div className="flex min-h-screen items-center justify-center bg-[#020617]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="ml-4 text-slate-300">Securing session...</p>
        </div>
      ) : (
        children
      )}
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

