import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'trustra_token';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer((s, a) => ({ ...s, ...a }), {
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    loading: true,
    initialized: false
  });

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ user: null, token: null, loading: false, initialized: true });
    navigate('/login');
  }, [navigate]);

  // 🔐 LOGIN HANDLER: Called by Login.jsx
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Save token to browser storage
      localStorage.setItem(TOKEN_KEY, data.token);
      
      // Update global state
      dispatch({ 
        user: data.user, 
        token: data.token, 
        loading: false, 
        initialized: true 
      });

      return data;
    } catch (error) {
      throw error; // Let Login.jsx handle the error toast
    }
  };

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isPublicPage = ['/login', '/register', '/'].includes(pathname);

    if (!token) {
      dispatch({ loading: false, initialized: true });
      if (!isPublicPage) navigate('/login');
      return;
    }

    try {
      // Handshake with Render backend
      const { data } = await api.get('/user/profile');
      dispatch({
        user: data.user || data,
        token,
        loading: false,
        initialized: true
      });
    } catch (error) {
      console.error("Auth Handshake Failed:", error);
      logout();
    }
  }, [navigate, pathname, logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const setUser = (userData) => dispatch({ user: userData });

  // Loading State - High-performance loader
  if (state.loading && !state.initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
