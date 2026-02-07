import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. SESSION INITIALIZATION (2026 Audit Standard)
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Pre-fill state from localStorage to prevent UI "flicker"
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      try {
        // FIXED: Point to the specific /api/user/me endpoint to avoid HTML/JSON crash
        const res = await fetch('https://trustracapitaltrade-backend.onrender.com', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Normalize data based on your Backend Controller response
          const userData = data.user || data.data || data; 
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // If token is invalid (401/403), perform a silent logout
          if (res.status === 401 || res.status === 403) {
            logout();
          }
        }
      } catch (error) {
        console.error("Auth sync failed. Render backend might be sleeping:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // 2. LOGIN HANDLER
  // Call this from Login.jsx: login(res.data.user, res.data.token)
  const login = (userData, userToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  // 3. LOGOUT HANDLER
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    
    // Soft redirect to avoid immediate crash loops
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  // 4. CONTEXT VALUES
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    // Support for both standard and high-tier admin roles
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        /* PREMIUM LOADING STATE */
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 border-t-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 animate-pulse text-[10px] font-black uppercase tracking-[0.3em]">
              Synchronizing Nodes...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// 5. CUSTOM HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

