import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Pre-fill from localStorage to prevent "flash"
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      try {
        // CRITICAL: Point this to your actual profile or verify endpoint
        // Fetching the base URL '/' returns HTML and crashes res.json()
        const res = await fetch('https://trustracapitaltrade-backend.onrender.com', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          const userData = data.user || data; // Handle both nested and flat responses
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // If token is invalid (401/403), log out
          logout();
        }
      } catch (error) {
        console.error("Auth sync failed (server might be sleeping):", error);
      } finally {
        setLoading(false);
      }
    };                                               
    initializeAuth();
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    // Use a soft redirect to avoid immediate crash loops
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };                                                 

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      }}
    >
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 border-t-2 border-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 animate-pulse text-xs uppercase tracking-widest">Verifying Session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

