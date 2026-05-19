// src/components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, initialized, user, loading } = useAuth();
  const location = useLocation();

  // Loading state
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

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Not an admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center">
            <ShieldAlert className="text-red-500" size={48} />
          </div>

          <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
          <p className="text-gray-400 mb-8">
            Administrator privileges are required to access this section.
          </p>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Admin access granted
  return <Outlet />;
};

export default AdminRoute;
