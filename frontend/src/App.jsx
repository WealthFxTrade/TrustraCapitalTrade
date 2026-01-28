import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './components/Login';
import Register from './components/Register';
import PlanSelection from './components/PlanSelection';
import Dashboard from './components/Dashboard';
<<<<<<< HEAD
import Landing from './components/Landing';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
=======
import AdminPanel from './components/AdminPanel';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
<<<<<<< HEAD
    const verifyUser = async () => {
=======
    const verify = async () => {
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
      if (!token) {
        setLoading(false);
        return;
      }
<<<<<<< HEAD

=======
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
<<<<<<< HEAD

        if (!res.ok) throw new Error('Invalid token');

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Auth verification failed:', err);
=======
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        setToken('');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

    verifyUser();
  }, [token]);

  const handleLogout = () => {
=======
    verify();
  }, [token]);

  const logout = () => {
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

<<<<<<< HEAD
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>;
  }
=======
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>;
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
<<<<<<< HEAD
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard token={token} user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

=======
        <Route path="/plan-selection" element={token ? <PlanSelection token={token} setUser={setUser} /> : <Navigate to="/register" />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} user={user} logout={logout} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token && user?.role === 'admin' ? <AdminPanel token={token} /> : <Navigate to="/" />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
