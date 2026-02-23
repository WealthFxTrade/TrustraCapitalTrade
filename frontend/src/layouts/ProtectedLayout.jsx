import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader'; 
import LoadingScreen from '../components/LoadingScreen';

export default function ProtectedLayout() {
  const { user, initialized } = useAuth();

  // 1️⃣ Wait for Auth verification
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2️⃣ Security Guard: Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Render the layout with DashboardHeader and dynamic page content
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Main content rendered via <Outlet /> */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-12">
        <Outlet />
      </main>
    </div>
  );
}
