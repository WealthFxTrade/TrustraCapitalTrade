import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

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
      return { ...state, user: action.payload, isAuthenticated: true, initialized: true };
    case 'AUTH_CLEAR':
      return { ...state, user: null, isAuthenticated: false, initialized: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // 🛰️ Initialize Auth: Check for existing session
  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      dispatch({ type: 'AUTH_CLEAR' });
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: 'AUTH_CLEAR' });
    }
  }, []);

  useEffect(() => { initAuth(); }, [initAuth]);

  // 🔐 Login Function
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    return data;
  };

  // 📝 Signup Function (Now supporting Phone Protocol)
  const signup = async (email, password, name, phone) => {
    const { data } = await api.post('/auth/register', { 
      email, 
      password, 
      name, 
      phone 
    });
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
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      signup, 
      logout, 
      refreshAuth: initAuth 
    }}>
      {state.initialized ? children : (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
