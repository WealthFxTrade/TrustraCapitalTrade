import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}
