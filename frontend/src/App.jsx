// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import PlanSelection from './components/PlanSelection';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Verify token and load user data
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
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl">Loading...</div>
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

        {/* Protected routes */}
        <Route
          path="/plan-selection"
          element={
            token ? (
              <PlanSelection token={token} setUser={setUser} />
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard token={token} user={user} logout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            token && user?.role === 'admin' ? (
              <AdminPanel token={token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
