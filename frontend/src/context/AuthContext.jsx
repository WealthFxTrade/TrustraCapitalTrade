import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false, // This tracks if we've finished the initial check
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true, error: null };
    case 'AUTH_FAILED':
      return { ...state, user: null, token: null, loading: false, initialized: true, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, token: null, loading: false, initialized: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [systemStatus, setSystemStatus] = useState({ maintenanceMode: false });
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const res = await api.get('/system/status');
      setSystemStatus(res.data);
    } catch (err) {
      console.warn("[System] Status check failed");
    }
  }, []);

  const initAuth = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    fetchSystemStatus();

    const storedToken = localStorage.getItem('token');
    
    // 💡 FIX 1: If no token, don't wait for Render.com. Show landing page immediately.
    if (!storedToken) {
      dispatch({ type: 'AUTH_FAILED', payload: 'Guest Session' });
      return;
    }

    // 🕒 FIX 2: Better Watchdog. Use a ref or simple timeout to force initialization.
    const watchdog = setTimeout(() => {
      dispatch({ type: 'AUTH_FAILED', payload: 'Node wake-up timeout' });
    }, 12000); // 12s for Render.com cold start

    try {
      const res = await api.get('/auth/profile');
      clearTimeout(watchdog);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user || res.data, token: storedToken }
      });
    } catch (err) {
      clearTimeout(watchdog);
      if (err.response?.status === 401) localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAILED', payload: 'Session expired' });
    }
  }, [fetchSystemStatus]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  // 💡 FIX 3: Conditional Rendering Logic.
  // ONLY show the loading screen if we have a token and haven't finished checking it.
  const isVerifyingExistingUser = !!localStorage.getItem('token') && !state.initialized;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, systemStatus }}>
      {isVerifyingExistingUser ? (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Securing Trustra Node...</p>
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

