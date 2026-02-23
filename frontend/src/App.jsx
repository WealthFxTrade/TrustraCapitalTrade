import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  // ⚡ SYNCED: Using 'initialized' from AuthContext
  const { initialized, user } = useAuth(); 
  const location = useLocation();

  // 🛡️ LOADING GATE: Stops guests from seeing the spinner forever
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  return (
    <Routes location={location} key={location.pathname}>
      {/* 🟢 Public Routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={
          user && (route.path === '/login' || route.path === '/register')
            ? <Navigate to="/dashboard" replace />
            : route.element
        } />
      ))}

      {/* 🔒 Protected Routes */}
      <Route element={user ? <ProtectedLayout /> : <Navigate to="/login" replace state={{ from: location }} />}>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 👑 Admin Routes */}
      <Route element={(user?.role === 'admin') ? <ProtectedLayout /> : <Navigate to="/" replace />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

