// src/components/routing/AdminRoute.jsx - FULLY CORRECTED & FINAL VERSION
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { user, isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  // Still loading or initializing auth state
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-6" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.4em] text-sm">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but NOT an admin
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    console.warn(`[ADMIN ROUTE] Access denied for \( {user.username} (role: \){user.role})`);
    return <Navigate to="/dashboard" replace />;
  }

  // User is admin → allow access to all admin routes
  return <Outlet />;
}
