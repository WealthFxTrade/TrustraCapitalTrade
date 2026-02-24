import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';  
import LoadingScreen from './components/LoadingScreen.jsx';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { initialized, user } = useAuth();
  const location = useLocation();

  // 1. Initial Session Check (Prevents Route Flashing)
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  return (
    <Routes location={location} key={location.pathname}>
      
      {/* 🟢 Public Routes (Login, Signup, Landing) */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            // Redirect logged-in users away from /login or /signup
            user && (route.path === '/login' || route.path === '/signup' || route.path === '/register')
              ? <Navigate to="/dashboard" replace />
              : route.element
          }
        />
      ))}

      {/* 🔒 Protected Routes (Standard Investor Access) */}
      <Route element={
        user 
          ? <ProtectedLayout /> 
          : <Navigate to="/login" replace state={{ from: location }} />
      }>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 👑 Admin Routes (Strict Authority Check) */}
      <Route element={
        (user && (user.role === 'admin' || user.isAdmin))
          ? <ProtectedLayout />
          : <Navigate to="/dashboard" replace />
      }>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 🧭 Global Redirect / 404 */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      
    </Routes>
  );
}
