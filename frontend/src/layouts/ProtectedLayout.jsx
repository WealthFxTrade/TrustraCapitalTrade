import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBtcPrice } from '../hooks/useBtcPrice'; // ⚡ Added for Header sync
import DashboardHeader from '../components/DashboardHeader';
import LoadingScreen from '../components/LoadingScreen';

export default function ProtectedLayout() {
  const { user, initialized } = useAuth();
  const location = useLocation();
  const btcPrice = useBtcPrice(60000); // Poll every 60s

  // 🛡️ Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 1️⃣ Wait for Auth verification (Prevents flickering)
  if (!initialized) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2️⃣ Security Guard: Redirect to login if user is not authenticated
  if (!user) {
    // Save the location they were trying to go to
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3️⃣ Render the layout with standardized spacing and motion
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-yellow-500/30">
      
      {/* FIXED: Passing btcPrice ensures the header is always "Live" */}
      <DashboardHeader btcPrice={btcPrice} user={user} />

      {/* Main content with entry animation */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Outlet context={{ btcPrice }} /> 
      </main>

      {/* Optional: Add a subtle background glow for the "Premium" look */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-yellow-500/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}

