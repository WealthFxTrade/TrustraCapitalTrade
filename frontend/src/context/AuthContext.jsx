import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../api/api';

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
      return { 
        ...state, 
        user: action.payload.user, 
        token: action.payload.token, 
        loading: false, 
        initialized: true 
      };
    case 'LOGOUT':
    case 'AUTH_FAILED':
      return { 
        ...state, 
        user: null, 
        token: null, 
        loading: false, 
        initialized: true 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAccessToken(null);
        return dispatch({ type: 'AUTH_FAILED' });
      }

      // Sync the token to the API helper immediately
      setAccessToken(token);

      try {
        const res = await api.get('/user/me');
        // Handle different backend response shapes
        const userData = res.data.user || res.data;
        dispatch({ type: 'LOGIN', payload: { user: userData, token } });
      } catch (err) {
        console.error("Auth Init Error:", err);
        localStorage.removeItem('token');
        setAccessToken(null);
        dispatch({ type: 'AUTH_FAILED' });
      }
    };

    initAuth();
  }, []);

  // 2. Login Action
  const login = useCallback(async (user, token) => {
    localStorage.setItem('token', token);
    // Use the centralized helper instead of setting headers.common
    setAccessToken(token); 
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return Promise.resolve();
  }, []);

  // 3. Logout Action
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, dispatch }}>
      {/* CRITICAL: We don't render children until the initial auth check is done.
         This prevents the Dashboard from trying to fetch stats with a null token.
      */}
      {state.loading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#05070a]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
