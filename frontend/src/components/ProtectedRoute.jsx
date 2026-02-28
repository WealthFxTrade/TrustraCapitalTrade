import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, token, loading, initialized } = useAuth();
  const location = useLocation();

  // 1. Wait for AuthContext to verify the token in localStorage
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.2em] text-[9px]">
            Verifying Node Credentials...
          </p>
        </div>
      </div>
    );
  }

  // 2. Not logged in? Send to login but remember where they wanted to go
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Trying to access Admin pages without being an Admin?
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. All checks passed - Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
