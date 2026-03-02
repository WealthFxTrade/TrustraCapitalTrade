// ... existing imports and reducer ...

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
    // Don't navigate if already on a public page to avoid loops
    if (!['/login', '/register', '/'].includes(window.location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: data.token },
      });
      return data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed.';
      dispatch({ type: 'SET_ERROR', payload: errMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      return;
    }

    try {
      // Handshake with backend to verify token and get fresh user data
      const { data } = await api.get('/auth/me'); 
      dispatch({ 
        type: 'AUTH_INIT_SUCCESS', 
        payload: { user: data.user } 
      });
    } catch (error) {
      console.error("Auth initialization failed:", error.message);
      localStorage.removeItem(TOKEN_KEY);
      dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const value = {
    ...state,
    login,
    logout,
    refreshAuth: initAuth, // Useful for updating UI after KYC/Profile changes
  };

  return (
    <AuthContext.Provider value={value}>
      {!state.initialized ? (
         <div className="min-h-screen bg-[#020408] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
         </div>
      ) : children}
    </AuthContext.Provider>
  );
}

// Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

