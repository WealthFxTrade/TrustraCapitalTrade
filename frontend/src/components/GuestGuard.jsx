import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function GuestGuard({ children }) {
  const { user, loading, initialized } = useAuth();

  // 1. Wait until AuthContext is ready
  if (!initialized || loading) return <LoadingScreen message="Checking access..." />;

  // 2. Redirect logged-in users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Otherwise, show guest page (login/register)
  return <>{children}</>;
}
