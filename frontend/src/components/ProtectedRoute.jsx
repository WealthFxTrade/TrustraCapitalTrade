// components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // adjust path if needed

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Still verifying auth (better UX than blank screen)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-indigo-400/80 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
            Authenticating Node...
          </p>
        </div>
      </div>
    );
  }

  // 2. Not logged in → redirect to login + preserve intended location
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Admin-only route check
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (adminOnly && !isAdmin) {
    // Optional: show a quick toast here if you want feedback
    // toast.error("Admin access required");
    return <Navigate to="/dashboard" replace />;
  }

  // 4. All good → render child route(s)
  return <Outlet />;
};
