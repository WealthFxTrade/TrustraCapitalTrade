import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // 1. RE-VALIDATE: Verify the token with the actual backend
          // We use the full URL to ensure it reaches the Render server directly during init
          const res = await fetch('https://trustracapitaltrade-backend.onrender.com', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            const data = await res.json();
            // Assuming your backend returns { user: { ... } }
            setUser(data.user);
            setToken(storedToken);
            // Sync localStorage with fresh data from server
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            // Token is invalid or expired
            throw new Error("Session expired");
          }
        } catch (error) {
          console.error("Auth re-validation failed:", error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } else {
        // No token found, just stop loading
        setLoading(false);
      }
      
      // CRITICAL: Ensure loading is set to false after the try/catch
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, userToken) => {
    if (!userData || !userToken) return;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
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
      {/* 
        This prevents Protected Routes from flashing or 
        redirecting before we know if the user is logged in.
      */}
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-indigo-500/20 rounded-full animate-pulse"></div>
            </div>
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

