// src/context/AuthContext.jsx
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/api'; 
import { API_ENDPOINTS } from '../constants/api';

const initialState = {
  user: null,
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
      return { ...initialState, initialized: true, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const tokenKey = 'token';

  // Session Initialization
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(tokenKey);
      
      if (!storedToken) {
        dispatch({ type: 'AUTH_FAILED', payload: null });
        return;
      }

      try {
        // Axios instance in api.js automatically attaches the Bearer token
        const res = await api.get(API_ENDPOINTS.USER.PROFILE);
        const userData = res.data.user || res.data;

        if (!userData) throw new Error('Invalid profile data');

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: userData, token: storedToken },
        });
      } catch (err) {
        console.error('[Auth Init Error]:', err.message);
        localStorage.removeItem(tokenKey);
        dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
      }
    };

    initAuth();
  }, []);

  // Login Handler
  const login = useCallback(async (userData, token) => {
    // Note: The actual API call is now handled in Login.jsx / api.js
    // This function simply synchronizes the global state.
    localStorage.setItem(tokenKey, token);
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: userData, token },
    });
  }, []);

  // Logout Handler
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } finally {
      localStorage.removeItem(tokenKey);
      dispatch({ type: 'LOGOUT' });
      toast.success('Secure Node Disconnected');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {!state.initialized ? (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
              Initializing Secure Node...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
