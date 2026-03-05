import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import api from '../api/api';

const AuthContext = createContext();
const TOKEN_KEY = 'trustra_token';

const initialState = { 
  user: null, 
  isAuthenticated: false, 
  initialized: false 
};

// ── AUTH REDUCER ENGINE ──
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
      const key = CryptoJS.enc.Hex.parse(import.meta.env.VITE_ENCRYPTION_KEY);
      const iv = CryptoJS.enc.Hex.parse(import.meta.env.VITE_ENCRYPTION_IV);
      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (err) {
      console.error("Encryption Failure:", err);
      return null;
    }
  };

  // 🛰️ INITIALIZE SESSION
  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return dispatch({ type: 'AUTH_CLEAR' });
    
    try {
      const { data } = await api.get('/auth/me');
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
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
    const { data } = await api.post('/auth/login', { email, password: cipher });
    
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    return data;
  };

  // 📝 REGISTRATION HANDSHAKE
  const signup = async (email, password, fullName, phone) => {
    const cipher = encryptPassword(password);
    
    // Convert "John Doe" to "john_doe" for Database consistency
    const username = fullName.trim().replace(/\s+/g, '_').toLowerCase();

    const { data } = await api.post('/auth/register', {
      username,
      email,
      password: cipher,
      phone
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    return data;
  };

  // 🔄 REACTIVE STATE UPDATE
  // Use this to update balances/stats without re-logging
  const setUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // 🚪 TERMINATE SESSION
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
      {state.initialized ? (
        children
      ) : (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
