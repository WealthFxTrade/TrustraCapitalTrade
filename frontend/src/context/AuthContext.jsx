import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; 
import api from '../api/api';

const AuthContext = createContext();
const TOKEN_KEY = 'trustra_token';

const initialState = { user: null, isAuthenticated: false, initialized: false };

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS': return { ...state, user: action.payload, isAuthenticated: true, initialized: true };
    case 'AUTH_CLEAR': return { ...state, user: null, isAuthenticated: false, initialized: true };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // 🔐 AES-256-CBC Encryption Logic
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
      console.error("🔒 Protocol Error: Encryption failed", err);
      return null;
    }
  };

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

  useEffect(() => { initAuth(); }, [initAuth]);

  const login = async (email, password) => {
    const cipher = encryptPassword(password);
    const { data } = await api.post('/auth/login', { email, password: cipher });
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    return data;
  };

  const signup = async (email, password, fullName) => {
    const cipher = encryptPassword(password);
    const { data } = await api.post('/auth/register', { fullName, email, password: cipher });
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshAuth: initAuth }}>
      {state.initialized ? children : <div className="loading-spinner" />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
