// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized, loading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto" />
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">
            Verifying Secure Session...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children or Outlet (for nested routes)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
