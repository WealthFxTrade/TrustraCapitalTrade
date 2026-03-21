// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token, loading, initialized, logout } = useAuth();
  const location = useLocation();

  // 1. Loading / initializing state
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
            Authenticating Node...
          </p>
        </div>
      </div>
    );
  }

  // 2. Auth check
  if (!user || !token) {
    logout?.(); // ensure local state & storage cleared
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verified – render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
