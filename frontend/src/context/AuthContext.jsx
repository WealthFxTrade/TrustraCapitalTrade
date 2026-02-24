import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Ensure this points to the file with the interceptor

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false, 
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true, error: null };
    case 'AUTH_FAILED':
      return { ...state, user: null, token: null, loading: false, initialized: true, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, initialized: true, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [systemStatus] = useState({ maintenanceMode: false });
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED', payload: null });
      return;
    }

    try {
      // Logic: The interceptor in api.js will automatically pick up storedToken
      const res = await api.get('/auth/profile');
      
      // Handle different backend response structures
      const userData = res.data.user || res.data.data || res.data;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token: storedToken }
      });
    } catch (err) {
      console.error("Auth Init Error:", err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
      dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
    }
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  /**
   * FIXED LOGIN: 
   * Must accept the full response data to ensure user object is saved.
   */
  const login = (user, token) => {
    localStorage.setItem('token', token);
    // Crucial: Update the user object in state immediately
    dispatch({ 
      type: 'AUTH_SUCCESS', 
      payload: { user, token } 
    });
    
    // Use replace: true to prevent user from going back to login page
    navigate('/dashboard', { replace: true });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clean up any other fragments
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }, [navigate]);

  // Sync state with Axios (Extra safety layer)
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, systemStatus }}>
      {/* 🔑 Prevent flickering: Don't render children until we know auth status */}
      {state.initialized ? children : (
        <div className="loading-screen">
          <p>Trustra Capital - Initializing Security...</p>
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

