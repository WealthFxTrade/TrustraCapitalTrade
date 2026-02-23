import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import PropTypes from 'prop-types';

/**
 * AuthGuard (Private Routes)
 * Prevents unauthenticated users from accessing protected content.
 */
export default function AuthGuard({ children }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // 1. Wait for Auth to initialize (Prevents flickering/false redirects)
  if (!initialized || loading) {
    return <LoadingScreen message="Securing session..." />;
  }

  // 2. If no user, redirect to login but save the current location 
  // so they can return here after logging in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

