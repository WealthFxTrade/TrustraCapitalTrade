// src/components/layout/ProtectedLayout.jsx
// Protected layout wrapper for authenticated user routes
// Redirects to login if not authenticated
// Redirects to dashboard if admin-only route accessed without admin role
// Shows loading screen while auth is initializing

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';   // Using @ alias (from vite.config.js)
import LoadingScreen from './LoadingScreen';

export default function ProtectedLayout({ adminOnly = false }) {
  const { user, loading, initialized } = useAuth();

  // 1. Wait until auth system is fully initialized
  //    Prevents flash of protected content or redirect loop
  if (!initialized || loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  // 2. Not authenticated → redirect to login
  //    Replace history so back button doesn't loop
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Admin-only route check
  //    Only allow access if user has admin or superadmin role
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authenticated and authorized → render child routes
  return <Outlet />;
}
