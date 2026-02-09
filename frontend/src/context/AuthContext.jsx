import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
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
        isAuthenticated: true,
      };
    case 'LOGOUT':
    case 'AUTH_FAILED':
      return { 
        ...initialState, 
        loading: false, 
        initialized: true 
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 1. AUTO-LOGIN: Check for token on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token'); // Matches api.js interceptor
      if (!token) {
        dispatch({ type: 'AUTH_FAILED' });
        return;
      }
      try {
        const res = await api.get('/auth/me');
        dispatch({
          type: 'LOGIN',
          payload: { user: res.data.user || res.data, token },
        });
      } catch (err) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAILED' });
      }
    };
    initAuth();
  }, []);

  // 2. LOGIN ACTION: Called by Login.jsx
  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({
      type: 'LOGIN',
      payload: { user, token },
    });
  };

  // 3. LOGOUT ACTION: Clears state and disk
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Securely logged out');
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

