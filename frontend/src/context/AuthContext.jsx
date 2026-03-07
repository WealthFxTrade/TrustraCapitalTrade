import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import io from 'socket.io-client'; // 🛰️ Added Socket.io Client
import api from '../api/api';
import { API_ENDPOINTS } from '../constants/api';

const AuthContext = createContext();
const TOKEN_KEY = 'trustra_token';

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        initialized: true
      };
    case 'UPDATE_USER':
      // 🛡️ Handles deep updates for balances and profile changes
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'AUTH_CLEAR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        initialized: true
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // 🔐 AES-256-CBC ENCRYPTION PROTOCOL
  const encryptPassword = (password) => {
    try {
      const keyHex = import.meta.env.VITE_ENCRYPTION_KEY;
      const ivHex = import.meta.env.VITE_ENCRYPTION_IV;
      if (!keyHex || !ivHex) return password;

      const key = CryptoJS.enc.Hex.parse(keyHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (err) {
      return password;
    }
  };

  // 🛰️ REAL-TIME SYNC ENGINE (Socket.io)
  useEffect(() => {
    let socket;
    if (state.isAuthenticated && state.user?._id) {
      // Connect to the backend using the ID as the room key
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:10000', {
        query: { userId: state.user._id }
      });

      // Listen for Rio Engine distributions or Admin adjustments
      socket.on('balanceUpdate', (data) => {
        console.log("🏙️ Zurich Mainnet: Balance Sync Received");
        dispatch({ type: 'UPDATE_USER', payload: data });
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [state.isAuthenticated, state.user?._id]);

  // 🛠️ INITIALIZE SESSION
  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      dispatch({ type: 'AUTH_CLEAR' });
      return;
    }

    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      // Ensure the payload is just the user object
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user || data });
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: 'AUTH_CLEAR' });
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 🔑 LOGIN HANDSHAKE
  const login = async (email, password) => {
    const cipher = encryptPassword(password);
    const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.trim(),
      password: cipher
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data;
  };

  // 📝 REGISTRATION HANDSHAKE
  const signup = async (email, password, fullName) => {
    const cipher = encryptPassword(password);
    const username = fullName.trim().replace(/\s+/g, '_').toLowerCase();

    const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      name: fullName,
      username,
      email: email.trim(),
      password: cipher
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data;
  };

  const setUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      refreshAuth: initAuth,
      setUser
    }}>
      {!state.initialized ? (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
