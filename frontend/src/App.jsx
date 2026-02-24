import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { initialized, user } = useAuth();
  const location = useLocation();

  // 1. Loading Gate
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  return (
    <Routes location={location} key={location.pathname}>
      
      {/* 🟢 Public Routes: Redirects logged-in users away from Auth pages */}
      {publicRoutes.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={
            user && (route.path === '/login' || route.path === '/register')
              ? <Navigate to="/dashboard" replace />
              : route.element
          } 
        />
      ))}

      {/* 🔒 Protected Routes: Standard User Access */}
      <Route element={user ? <ProtectedLayout /> : <Navigate to="/login" replace state={{ from: location }} />}>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 👑 Admin Routes: Strict Role Check */}
      <Route element={
        (user && user.role === 'admin') 
          ? <ProtectedLayout /> 
          : <Navigate to="/dashboard" replace /> // Redirect non-admins to user dashboard, not home
      }>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

