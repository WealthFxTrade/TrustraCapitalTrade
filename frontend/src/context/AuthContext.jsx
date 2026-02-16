import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../api/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false, // 🔑 The "Shield" against early redirects
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
      };
    case 'AUTH_FAILED':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setAccessToken(null);
      return dispatch({ type: 'AUTH_FAILED' });
    }

    // Set token immediately so the first request has it
    setAccessToken(token);

    try {
      /** 
       * 💡 NOTE: Your api.jsx interceptor will handle token refresh 
       * automatically if this call returns a 401. 
       */
      const res = await api.get('/auth/profile');
      const userData = res.data.user || res.data;
      
      // Get the LATEST token (in case the interceptor refreshed it during the call)
      const currentToken = localStorage.getItem('token');
      
      dispatch({ type: 'LOGIN', payload: { user: userData, token: currentToken } });
    } catch (err) {
      console.error('Auth initialization failed:', err);
      // Only clear if it's a genuine auth error, not a network timeout
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        setAccessToken(null);
      }
      dispatch({ type: 'AUTH_FAILED' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback((user, token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
    // Use replace to prevent "back button" returning to dashboard
    window.location.replace('/login');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {/* 🛡️ Critical: Do not render children until initialization is complete */}
      {!state.initialized ? (
        <div className="flex items-center justify-center min-h-screen bg-[#020617]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

