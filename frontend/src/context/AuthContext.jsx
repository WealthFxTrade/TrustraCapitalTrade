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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'AUTH_CLEAR' });
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, logout, refreshAuth: initAuth }}>
      {state.initialized ? children : (
        <div className="min-h-screen bg-[#020408] flex items-center justify-center">
           <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
