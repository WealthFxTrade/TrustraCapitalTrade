import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  initialized: false, // Critical for App.jsx
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true };
    case 'LOGOUT':
    case 'AUTH_FAILED':
      return { ...initialState, loading: false, initialized: true, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return dispatch({ type: 'AUTH_FAILED' });
      try {
        const res = await api.get('/auth/me');
        dispatch({ type: 'LOGIN', payload: { user: res.data.user || res.data, token } });
      } catch (err) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAILED' });
      }
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

