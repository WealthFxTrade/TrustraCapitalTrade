// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, initialized, loading } = useAuth();
  const location = useLocation();

  // 1. Still initializing or loading auth state → show spinner (prevents flash/redirect loop)
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.4em] text-sm">
            Verifying secure node access...
          </p>
          <p className="text-gray-600 text-xs">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // 2. Not authenticated → redirect to login with "from" state (so we can redirect back after login)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated → render child routes (Dashboard, Deposit, etc.)
  return <Outlet />;
};

export default ProtectedRoute;
