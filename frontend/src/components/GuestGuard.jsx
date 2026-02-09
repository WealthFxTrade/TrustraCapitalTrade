import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function GuestGuard({ children }) {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) return <LoadingScreen />;

  // If user is already logged in, send them to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

