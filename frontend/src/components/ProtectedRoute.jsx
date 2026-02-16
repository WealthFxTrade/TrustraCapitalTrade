import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 🔒 ProtectedRoute Component
 * Protects routes based on authentication and optional admin-only access.
 * 
 * Usage:
 * <Route element={<ProtectedRoute />}>
 *    <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * 
 * Admin-only example:
 * <Route element={<ProtectedRoute adminOnly={true} />}>
 *    <Route path="/admin" element={<AdminPanel />} />
 * </Route>
 */
export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1️⃣ Loading State: show spinner during auth initialization
  if (isLoading) {
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

  // 2️⃣ Not authenticated → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3️⃣ User banned → force logout
  if (user.banned) {
    return <Navigate to="/login" replace />;
  }

  // 4️⃣ Admin-only check
  const isAdmin = user.role === 'admin' || user.isAdmin === true;
  if (adminOnly && !isAdmin) {
    console.warn(`[UNAUTHORIZED_ACCESS] Attempt by: ${user.email} at ${location.pathname}`);
    return <Navigate to="/dashboard" replace />;
  }

  // 5️⃣ Success → render nested routes
  return <Outlet />;
};
