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
      return { ...initialState, loading: false, initialized: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token'); // Matches api.js
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

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

