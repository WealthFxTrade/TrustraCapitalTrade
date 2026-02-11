import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  initialized: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true };
    case 'LOGOUT':
    case 'AUTH_FAILED':
      return { ...state, user: null, token: null, loading: false, initialized: true };
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
        const res = await api.get('/user/me');
        dispatch({ type: 'LOGIN', payload: { user: res.data.user || res.data, token } });
      } catch (err) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_FAILED' });
      }
    };
    initAuth();
  }, []);

  const login = async (user, token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

