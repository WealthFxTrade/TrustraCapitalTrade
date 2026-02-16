import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 🔒 ProtectedRoute Component
 * Synchronized with AuthContext 'loading' and 'initialized' states.
 */
export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // 1️⃣ INITIALIZATION & LOADING STATE
  // We must wait for 'initialized' to be true. 
  // If we don't, the component redirects before the API check finishes.
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-yellow-900/20"></div>
          <p className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
            Syncing Secure Node...
          </p>
        </div>
      </div>
    );
  }

  // 2️⃣ AUTHENTICATION CHECK
  // Since 'initialized' is now true, if 'user' is null, they are definitely logged out.
  if (!user) {
    // We save the 'from' location so we can redirect them back after they login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3️⃣ STATUS CHECK (Banned/Suspended)
  if (user.banned || user.status === 'suspended') {
    console.error(`[ACCESS_DENIED] Account status restricted for: ${user.email}`);
    return <Navigate to="/login" replace />;
  }

  // 4️⃣ ROLE-BASED ACCESS CONTROL (RBAC)
  // Checks both common naming conventions for admin flags
  const isAdmin = user.role === 'admin' || user.isAdmin === true;
  
  if (adminOnly && !isAdmin) {
    console.warn(`[UNAUTHORIZED_ACCESS] ${user.email} attempted to access ${location.pathname}`);
    // Redirect to user dashboard instead of login if they are authenticated but not admin
    return <Navigate to="/dashboard" replace />;
  }

  // 5️⃣ AUTHORIZED → Render the requested route
  return <Outlet />;
};

export default ProtectedRoute;

