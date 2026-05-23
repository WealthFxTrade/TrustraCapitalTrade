// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, initialized, user, loading } = useAuth();
  const location = useLocation();

  // 1. Still initializing auth → Show loading
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

  // 2. Not authenticated → Redirect to login with return path
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Role-based redirection logic
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  // Redirect admins trying to access user dashboard
  if (isAdmin && location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/dashboard/profile')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect regular users trying to access admin routes
  if (!isAdmin && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authorized user → Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
