/**
 * src/components/ProtectedRoute.jsx - Production v8.4.2
 * Enforces session integrity and Role-Based Access Control.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, token, loading, initialized } = useAuth();
  const location = useLocation();

  // 1. Initializing State: Wait for AuthContext to verify JWT with Backend
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">
            Authenticating Node...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication Check: Redirect to login if credentials are missing
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorization Check: RBAC for Admin-only vaults
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Verification Passed: Render the requested layout/page
  return <Outlet />;
};

export default ProtectedRoute;
