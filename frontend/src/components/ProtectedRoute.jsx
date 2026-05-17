// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, initialized, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while AuthContext is initializing
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-emerald-500 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Admin redirect logic
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (isAdmin && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Allow access
  return <Outlet />;
};

export default ProtectedRoute;
