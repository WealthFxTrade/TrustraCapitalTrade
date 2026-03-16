import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500">
        Verifying admin access...
      </div>
    );
  }

  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
