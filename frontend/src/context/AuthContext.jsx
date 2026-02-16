import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../api/api';

const AuthContext = createContext(null);

// 🔹 Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  initialized: false,
};

// 🔹 Reducer
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
    case 'LOGOUT':
    case 'AUTH_FAILED':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// 🔹 Provider
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🌟 Initialize Auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAccessToken(null);
        return dispatch({ type: 'AUTH_FAILED' });
      }

      setAccessToken(token);
      try {
        // Endpoint returning the current user
        const res = await api.get('/auth/profile'); 
        const userData = res.data.user || res.data;
        dispatch({ type: 'LOGIN', payload: { user: userData, token } });
      } catch (err) {
        console.error('Auth initialization failed:', err);
        localStorage.removeItem('token');
        setAccessToken(null);
        dispatch({ type: 'AUTH_FAILED' });
      }
    };

    initAuth();
  }, []);

  // 🔑 Login function
  const login = useCallback(async (user, token) => {
    localStorage.setItem('token', token);
    setAccessToken(token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
  }, []);

  // 🔒 Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {state.loading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#020617]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// 🔗 Hook to use auth anywhere
export const useAuth = () => useContext(AuthContext);
