// src/App.jsx
import React, { Suspense } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages (consider lazy loading in production)
import Landing from './components/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import Invest from './pages/Invest.jsx';
import Withdraw from './pages/WithdrawalPage.jsx';
import Deposit from './pages/DepositPage.jsx';
import ProfilePage from './pages/Profile.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminWithdrawals from './pages/AdminWithdrawals.jsx';

// ── Protected Layout ───────────────────────────────────────
function ProtectedLayout({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// ── Auth Guard (prevent logged-in users from seeing login/signup) ──
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or spinner

  if (user) {
    // Redirect to intended destination or dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: 'bg-slate-900 text-white border border-slate-700 shadow-xl',
        }}
      />

      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <Routes>
          {/* Public routes – block if already logged in */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Landing />
              </AuthGuard>
            }
          />
          <Route
            path="/login"
            element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            }
          />
          <Route
            path="/register"
            element={
              <AuthGuard>
                <Signup />
              </AuthGuard>
            }
          />

          {/* Protected user routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedLayout adminOnly />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
