import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

const AuthContext = createContext();
const TOKEN_KEY = 'trustra_token';

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, isAuthenticated: true, initialized: true };
    case 'AUTH_CLEAR':
      return { ...state, user: null, isAuthenticated: false, initialized: true };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  const initAuth = useCallback(async () => {
    // With httpOnly cookies + withCredentials: true, we don't need to read token manually
    // Just call profile endpoint – cookie will be sent automatically
    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data } });
    } catch (err) {
      console.warn('[AUTH INIT FAILED]', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      dispatch({ type: 'AUTH_CLEAR' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── SIGNUP ── (creates account + auto-login via cookie)
  const signup = async (email, password, name, phone) => {
    try {
      const username = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      if (username.length < 3) {
        throw new Error('Name must be long enough to create a valid username');
      }

      const payload = {
        name: name.trim(),
        username,
        email: email.trim(),
        password,
        phone: phone.trim(),
      };

      const { data } = await api.post(API_ENDPOINTS.AUTH.SIGNUP, payload);

      // No need to store token manually — httpOnly cookie is set by backend
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data } });

      return data;
    } catch (err) {
      console.error('[SIGNUP CONTEXT ERROR]', {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
      });
      throw err;
    }
  };

  // ── LOGIN ── (sets cookie via backend)
  const login = async (email, password) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });

      // No localStorage token needed — cookie is set by backend
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data } });

      return data;
    } catch (err) {
      console.error('[LOGIN CONTEXT ERROR]', {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
      });
      throw err;
    }
  };

  // ── LOGOUT ── (clears cookie via backend or client)
  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    }

    // Clear any remaining client-side state
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ ...state, signup, login, logout }}>
      {state.initialized ? (
        children
      ) : (
        <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 text-xl font-medium">
          Initializing secure node...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
