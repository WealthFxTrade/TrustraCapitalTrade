import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, fallbackRoute } from './routes';

export default function App() {
  const { initialized, user } = useAuth();

  if (!initialized) return <LoadingScreen message="Securing Trustra Node..." />;

  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            user && (r.path === '/login' || r.path === '/register')
              ? <Navigate to="/dashboard" replace />
              : r.element
          }
        />
      ))}

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        {protectedRoutes.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={user ? r.element : <Navigate to="/login" replace />}
          />
        ))}
      </Route>

      {/* Fallback */}
      <Route path={fallbackRoute.path} element={fallbackRoute.element} />
    </Routes>
  );
}
