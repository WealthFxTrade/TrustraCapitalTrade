import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const location = useLocation();

  // ONLY block until auth boot finishes
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  // block unauthenticated users
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // admin redirect safety
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin';

  if (isAdmin && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
