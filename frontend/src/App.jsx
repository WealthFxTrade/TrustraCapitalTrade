// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PlanSelection from './pages/PlanSelection';
import Deposit from './pages/Deposit';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// 404
import NotFoundPage from './pages/NotFoundPage';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync auth state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Navbar logout={logout} user={user} />

      <AppContent
        token={token}
        setToken={setToken}
        user={user}
        setUser={setUser}
        loading={loading}
        setLoading={setLoading}
        authError={authError}
        setAuthError={setAuthError}
        logout={logout}
      />
    </BrowserRouter>
  );
}

function AppContent({
  token,
  setToken,
  user,
  setUser,
  loading,
  setLoading,
  authError,
  setAuthError,
  logout,
}) {
  const navigate = useNavigate();

  // Verify JWT & load user
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => 'Unknown error');
          throw new Error(`Auth failed: \( {res.status} - \){errText}`);
        }

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error('Auth verification failed:', err.message);
        setAuthError(err.message);
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token, navigate, setToken, setUser, setLoading, setAuthError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h2>
          <p className="text-lg mb-6">{authError}</p>
          <button
            onClick={() => {
              setAuthError(null);
              navigate('/login', { replace: true });
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} setUser={setUser} />}
      />

      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User protected routes */}
      <Route
        path="/dashboard"
        element={token ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/plans"
        element={token ? <PlanSelection /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/deposit"
        element={token ? <Deposit /> : <Navigate to="/login" replace />}
      />

      {/* Admin protected route */}
      <Route
        path="/admin"
        element={
          token && user?.role === 'admin' ? (
            <AdminDashboard token={token} logout={logout} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
