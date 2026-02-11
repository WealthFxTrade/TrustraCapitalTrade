import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, fallbackRoute } from './routes';

export default function App() {
  const { initialized, user } = useAuth();

  // 1. Wait for AuthContext to verify the token/user before rendering anything
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  return (
    <Routes>
      {/* Public routes (Login/Register/Landing) */}
      {publicRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            // Redirect logged-in users away from Auth pages to Dashboard
            user && (r.path === '/login' || r.path === '/register') 
              ? <Navigate to="/dashboard" replace /> 
              : r.element
          }
        />
      ))}

      {/* Protected routes (Dashboard/Nodes/Wallet) */}
      {/* The ProtectedLayout should be the only place checking 'user' for these routes */}
      <Route element={<ProtectedLayout />}>
        {protectedRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* Fallback (404) */}
      <Route path="*" element={fallbackRoute.element || <Navigate to="/" replace />} />
    </Routes>
  );
}

