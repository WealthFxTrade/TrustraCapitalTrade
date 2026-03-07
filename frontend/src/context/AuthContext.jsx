import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../api/api';
import { API_ENDPOINTS, SOCKET_URL } from '../constants/api';

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
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        initialized: true, // 🔓 Unlocks the UI
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'AUTH_CLEAR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        initialized: true, // 🔓 Unlocks the UI even on failure
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: true,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // ── REAL-TIME SOCKET CONNECTION ──
  useEffect(() => {
    let socket;
    const token = localStorage.getItem(TOKEN_KEY);

    if (state.isAuthenticated && state.user?._id && token) {
      console.log('📡 Connecting socket to Zurich Mainnet:', SOCKET_URL);
      
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
      });

      socket.on('balanceUpdate', (data) => {
        console.log('💰 Balance update received:', data);
        // data usually contains { balances, totalProfit }
        dispatch({ type: 'UPDATE_USER', payload: data });
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });

      socket.on('connect_error', (err) => {
        console.warn('⚠️ Socket connection error:', err.message);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('🧹 Socket cleaned up');
      }
    };
  }, [state.isAuthenticated, state.user?._id]);

  // ── INITIALIZE AUTH SESSION ──
  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      console.log('ℹ️ No session token found. Initializing public node.');
      dispatch({ type: 'AUTH_CLEAR' });
      return;
    }                                                                                   

    try {
      console.log('🛰️ Validating session protocol...');
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE, {
        timeout: 10000, // 10s timeout to prevent hanging
      });

      // Flexible check for { user: {...} } or { data: { user: {...} } }
      const userData = response.data?.user || response.data;

      if (userData) {
        console.log('👤 Profile synchronized:', userData.email);
        dispatch({ type: 'AUTH_SUCCESS', payload: { ...userData, token } });
      } else {
        console.warn('⚠️ Received empty user data from node.');
        dispatch({ type: 'AUTH_CLEAR' });
      }
    } catch (error) {
      console.error('❌ Session validation failed:', error.response?.data?.message || error.message);
      
      // Clear token only on explicit 401/403 (Invalid token)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
      }
      
      dispatch({ type: 'AUTH_CLEAR' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ── AUTH ACTIONS ──
  const login = async (email, password) => {
    try {
      console.log('🔑 Login attempt for:', email);
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.trim(),
        password,
      });                                                                               
      
      localStorage.setItem(TOKEN_KEY, data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { ...data.user, token: data.token } });
      return data;
    } catch (err) {                                                                           
      console.error('🚫 Login failed:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      const username = name.trim().replace(/\s+/g, '_').toLowerCase();
      console.log('📝 Creating account for:', username);

      const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        username,
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        dispatch({ type: 'AUTH_SUCCESS', payload: { ...data.user, token: data.token } });
      }
      return data;
    } catch (err) {
      console.error('🚫 Signup failed:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const setUser = (userData) => {                                                           
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login');
    console.log('👋 Session ended');
  }, [navigate]);

  const value = {
    ...state,
    login,
    signup,
    logout,
    refreshAuth: initAuth,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>                                                      
      {!state.initialized ? (
        <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60">                       
            Initializing Trustra Session...
          </span>
        </div>
      ) : (
        children
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
