// src/components/layout/ProtectedLayout.jsx
// Protected layout wrapper for authenticated user routes
// Redirects to login if not authenticated
// Redirects to dashboard if admin-only route accessed without admin role
// Shows loading screen while auth is initializing

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedLayout({ adminOnly = false }) {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    initialized, 
    error 
  } = useAuth();

  // Detailed logging for debugging
  console.log('[ProtectedLayout] Current Auth State:', {
    initialized,
    loading,
    isAuthenticated,
    hasUser: !!user,
    userEmail: user?.email || null,
    userRole: user?.role || null,
    error: error || null,
    adminOnly
  });

  // 1. Still initializing or loading → show loading screen
  if (!initialized || loading) {
    console.log('[ProtectedLayout] Still initializing... showing LoadingScreen');
    return <LoadingScreen message="Verifying session..." />;
  }

  // 2. Not authenticated or no user object → redirect to login
  if (!isAuthenticated || !user) {
    console.log('[ProtectedLayout] User not authenticated → redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // 3. Admin-only route check
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (adminOnly && !isAdmin) {
    console.log('[ProtectedLayout] Admin access denied → redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Everything is good → render the protected child routes (Dashboard, etc.)
  console.log('[ProtectedLayout] ✅ Access Granted → Rendering protected content (Outlet)');
  
  return <Outlet />;
}
