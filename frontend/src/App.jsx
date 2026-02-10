import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import Landing from './pages/Landing';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { initialized } = useAuth();

  // If we haven't finished the first auth check, show nothing but the loader
  if (!initialized) return <LoadingScreen message="Securing Trustra Node..." />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Other protected routes here */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

