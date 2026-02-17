// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import api, { setAccessToken } from '../api/api';

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
    case 'LOGIN':
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
        error: action.payload?.message || 'Authentication failed',
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
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setAccessToken(null);
      dispatch({ type: 'AUTH_FAILED', payload: { message: 'No token found' } });
      return;
    }

    setAccessToken(storedToken);

    try {
      const res = await api.get('/auth/profile');
      const userData = res.data.user || res.data;
      const currentToken = localStorage.getItem('token');

      dispatch({
        type: 'LOGIN',
        payload: { user: userData, token: currentToken },
      });
    } catch (err) {
      console.error('[Auth] Initialization failed:', err);

      const status = err.response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        setAccessToken(null);
        dispatch({
          type: 'AUTH_FAILED',
          payload: { message: 'Session expired or invalid credentials' },
        });
      } else {
        dispatch({
          type: 'AUTH_FAILED',
          payload: { message: 'Network or server error during auth check' },
        });
      }
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback((user, token) => {
    if (!token) return;

    localStorage.setItem('token', token);
    setAccessToken(token);
    dispatch({
      type: 'LOGIN',
      payload: { user, token },
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });

    // Prefer navigate if router is available in your app
    // For now, use replace to prevent back-button issues
    setTimeout(() => {
      window.location.replace('/login');
    }, 0);
  }, []);

  const isReady = state.initialized && !state.loading;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isReady }}>
      {!isReady ? (
        <div className="flex min-h-screen items-center justify-center bg-[#020617]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="ml-4 text-slate-300">Securing session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Missing hook – this fixes the build error in DashboardHeader and others
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
