// src/components/layout/ProtectedLayout.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedLayout({ adminOnly = false }) {
  const { 
    user, 
    isAuthenticated, 
    initialized, 
    loading 
  } = useAuth();

  // Still loading or initializing authentication
  if (!initialized || loading) {
    return <LoadingScreen message="Verifying your secure session..." />;
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route protection
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed → render protected routes
  return <Outlet />;
}
