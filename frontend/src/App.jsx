// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// All pages are in src/components/
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import PlanSelection from './components/PlanSelection';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Verify token & load user
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Invalid or expired token');
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Auth verification failed:', err);
        setToken('');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token, navigate]);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Email verification & resend */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />

        {/* Protected routes */}
        <Route
          path="/plan-selection"
          element={token ? <PlanSelection token={token} setUser={setUser} /> : <Navigate to="/register" replace />}
        />

        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} user={user} logout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/admin"
          element={token && user?.role === 'admin' ? <AdminPanel token={token} /> : <Navigate to="/" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
