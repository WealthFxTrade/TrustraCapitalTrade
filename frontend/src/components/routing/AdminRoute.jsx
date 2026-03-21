// src/components/routing/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminRoute() {
  const { user, isAuthenticated, initialized, loading, logout } = useAuth();
  const location = useLocation();

  // 1. Loading / initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.3em]">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication check
  if (!isAuthenticated || !user) {
    logout?.(); // clear stale session
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorization check
  if (!['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Verified admin → render nested routes
  return <Outlet />;
}
