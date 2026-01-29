// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PlanSelection from './components/PlanSelection';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';

const TOKEN_KEY = 'trustra_token';
const USER_KEY = 'trustra_user';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem(USER_KEY)) || null);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [token, user]);

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} setUser={setUser} />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register setToken={setToken} setUser={setUser} />}
        />

        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} user={user} logout={logout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/plan-selection"
          element={token ? <PlanSelection token={token} setUser={setUser} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/deposit"
          element={token ? <Deposit token={token} setUser={setUser} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/withdraw"
          element={token ? <Withdraw token={token} setUser={setUser} /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
