import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,       // ❌ do NOT preload token here
  token: null,
  loading: true,
  initialized: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
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
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED' });
      return;
    }

    try {
      // Interceptor attaches token automatically
      const res = await api.get('/auth/profile');
      const userData = res.data.user || res.data.data || res.data;

      // Only set user if valid profile returned
      if (!userData || !userData.id) throw new Error('Invalid user');

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, token: storedToken } });
    } catch (err) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback((userData, token) => {
    if (!userData || !userData.id) return;
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, token } });
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {state.initialized ? (
        children
      ) : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
          Trustra Node: Initializing...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
