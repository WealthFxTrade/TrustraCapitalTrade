// src/components/routing/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminRoute() {
  const { user, isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  // 1. Still initializing authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-6" />
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-sm">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  // 2. Not authenticated → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but not admin/superadmin → redirect to user dashboard
  if (!['admin', 'superadmin'].includes(user.role)) {
    console.warn(`[ADMIN ROUTE] Access denied for \( {user.email || user.username} (role: \){user.role})`);
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authorized Admin → render child routes
  return <Outlet />;
}
