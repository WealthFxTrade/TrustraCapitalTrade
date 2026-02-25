import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  initialized: false,
  error: null,
};

// ──────────────────────────────────────────────
// Reducer
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// AuthProvider
// ──────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const tokenKey = 'token';

  // Normalize user id (_id vs id)
  const normalizeUser = (userData) => {
    if (!userData) return null;
    return { ...userData, id: userData.id || userData._id };
  };

  // Initialize auth on mount
  const initAuth = useCallback(async () => {
    const storedToken = localStorage.getItem(tokenKey);
    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED' });
      return;
    }

    try {
      const res = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const userData = normalizeUser(res.data.user || res.data.data || res.data);
      if (!userData || !userData.id) throw new Error('Invalid user');
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, token: storedToken } });
    } catch (err) {
      console.warn('[AuthContext] initAuth failed:', err.message);
      localStorage.removeItem(tokenKey);
      dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login
  const login = useCallback((userData, token) => {
    const normalized = normalizeUser(userData);
    if (!normalized || !normalized.id) return;
    localStorage.setItem(tokenKey, token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: normalized, token } });
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
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

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
