import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false, // 🔑 The gatekeeper
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true, error: null };
    case 'AUTH_FAILED':
      return { ...state, user: null, token: null, loading: false, initialized: true, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, token: null, loading: false, initialized: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [systemStatus, setSystemStatus] = useState({ maintenanceMode: false });
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const storedToken = localStorage.getItem('token');

    // ⚡ GUEST CHECK: No token? Initialize immediately so landing page shows.
    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED', payload: 'Guest Session' });
      return;
    }

    try {
      const res = await api.get('/auth/profile');
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user || res.data, token: storedToken }
      });
    } catch (err) {
      if (err.response?.status === 401) localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
    }
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, systemStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

