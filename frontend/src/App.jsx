// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import Landing from './pages/Landing';
import DashboardPage from './pages/DashboardPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { initialized, user } = useAuth();

  // Wait for auth to initialize
  if (!initialized) return <LoadingScreen message="Securing Trustra Node..." />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Add other protected routes here */}
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
