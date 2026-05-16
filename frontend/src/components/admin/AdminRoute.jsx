// src/components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, initialized, user, loading } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs">
            VERIFYING ADMINISTRATOR ACCESS
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin or superadmin role
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        state={{ 
          message: "Access Denied. Administrator privileges required." 
        }}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
