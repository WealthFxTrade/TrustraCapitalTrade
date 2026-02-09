import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

/* ---------------- INITIAL STATE ---------------- */
const initialState = {
  user: null,
  accessToken: null,
  loading: true,        // Used by guards
  initialized: false,  // CRITICAL: stops white screen
  isAuthenticated: false,
};

/* ---------------- REDUCER ---------------- */
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        loading: false,
        initialized: true,
        isAuthenticated: true,
      };

    case 'LOGOUT':
    case 'AUTH_FAILED':
      return {
        ...initialState,
        loading: false,
        initialized: true,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };

    default:
      return state;
  }
}

/* ---------------- PROVIDER ---------------- */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        dispatch({ type: 'AUTH_FAILED' });
        return;
      }

      try {
        const res = await api.get('/auth/me');

        dispatch({
          type: 'LOGIN',
          payload: {
            user: res.data.user || res.data,
            accessToken: token,
          },
        });
      } catch (err) {
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILED' });
      }
    };

    initAuth();
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const logout = () => {
    localStorage.removeItem('accessToken');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
