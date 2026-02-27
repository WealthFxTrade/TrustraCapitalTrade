// src/context/AuthContext.jsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/api'; // centralized axios instance
import { API_ENDPOINTS } from '../constants/api';

// ──────────────────────────────────────────────
// Initial State
// ──────────────────────────────────────────────
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
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// Auth Context
// ──────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const tokenKey = 'token';

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      const storedToken = localStorage.getItem(tokenKey);
      if (!storedToken) {
        dispatch({ type: 'AUTH_FAILED', payload: 'No token found' });
        return;
      }

      try {
        // Use centralized api instance (automatically adds Bearer token)
        const res = await api.get(API_ENDPOINTS.USER.PROFILE);

        const userData = res.data.user || res.data.data || res.data;

        if (!userData) {
          throw new Error('Invalid user data from server');
        }

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: userData, token: storedToken },
        });
      } catch (err) {
        console.warn('[Auth Init] Failed:', err.message);
        localStorage.removeItem(tokenKey);
        dispatch({ type: 'AUTH_FAILED', payload: 'Session invalid or expired' });
        toast.error('Session expired. Please log in again.');
      }
    };

    initAuth();
  }, []);

  // Login function (called from Login page)
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { user, token } = res.data;

      if (!user || !token) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem(tokenKey, token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch({ type: 'AUTH_FAILED', payload: msg });
      toast.error(msg);
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Optional: call backend logout if your API supports it
      await api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
        // Ignore backend logout failure (token removal is enough)
      });
    } catch (err) {
      console.warn('Backend logout failed:', err);
    } finally {
      localStorage.removeItem(tokenKey);
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {state.initialized ? (
        children
      ) : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-indigo-400 font-semibold text-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Initializing secure session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
