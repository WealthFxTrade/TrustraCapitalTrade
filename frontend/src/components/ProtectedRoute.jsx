// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, initialized, user, loading } = useAuth();
  const location = useLocation();

  // Still initializing authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-emerald-500 text-sm font-medium">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ====================== ADMIN REDIRECTION ======================
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Redirect admins away from user dashboard
  if (isAdmin && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect non-admins away from admin routes (optional but recommended)
  if (!isAdmin && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized user → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
