import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedLayout({ adminOnly = false }) {
  const { user, loading, initialized } = useAuth();

  // 1. WAIT until auth system is fully initialized
  if (!initialized || loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  // 2. Not authenticated → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Admin gate
  const isAdmin =
    user.role === 'admin' || user.role === 'superadmin';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Auth OK → render nested routes
  return <Outlet />;
}
