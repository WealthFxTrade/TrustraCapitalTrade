import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated path to match standard

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Institutional Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          {/* Gold Pulse Spinner to match Trustra Branding */}
          <div className="h-12 w-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-yellow-900/20"></div>
          <p className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
            Syncing Secure Node...
          </p>
        </div>
      </div>
    );
  }

  // 2. Not logged in → Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. User Banned Check (Critical for Financial Sites)
  if (user.banned) {
    return <Navigate to="/login" replace />; // Force logout for banned users
  }

  // 4. Enhanced Admin-Only Logic
  // Matches backend User.js schema: both role check and the isAdmin boolean
  const isAdmin = user.role === 'admin' || user.isAdmin === true;

  if (adminOnly && !isAdmin) {
    console.warn(`[UNAUTHORIZED_ACCESS] Attempt by: ${user.email} at ${location.pathname}`);
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Success → Render Child Routes via Outlet
  return <Outlet />;
};

