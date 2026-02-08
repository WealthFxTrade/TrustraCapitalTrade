import React, { Suspense } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  Outlet, 
  useLocation 
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
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

// ── Protected Layout (Handles Authentication & Role-Based Access) ──
function ProtectedLayout({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 animate-pulse text-[10px] font-black uppercase tracking-[0.3em]">
            Authenticating Node...
          </p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin access control - supports 'admin' and 'superadmin' roles
  const isAuthorized = user.role === 'admin' || user.role === 'superadmin';
  if (adminOnly && !isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// ── Auth Guard (Prevents logged-in users from seeing public pages) ──
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Wait for auth to resolve

  if (user) {
    // Redirect logged-in users to dashboard or the page they came from
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}

// ── Root App Component ──
export default function App() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-50 selection:bg-blue-500/30">
      {/* Global Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#0a0d14',
            color: '#fff',
            border: '1px solid #1e293b',
            fontSize: '12px',
            fontWeight: 'bold'
          },
        }}
      />

      {/* Route System */}
      <Suspense fallback={<div className="min-h-screen bg-[#05070a]" />}>
        <Routes>
          
          {/* Public Routes (Blocked if Logged In) */}
          <Route path="/" element={
            <AuthGuard>
              <Landing />
            </AuthGuard>
          } />
          <Route path="/login" element={
            <AuthGuard>
              <Login />
            </AuthGuard>
          } />
          <Route path="/register" element={
            <AuthGuard>
              <Signup />
            </AuthGuard>
          } />

          {/* Protected User Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Administrative Routes */}
          <Route element={<ProtectedLayout adminOnly />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          </Route>

          {/* ── Route Fallback (Catch-All) ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Suspense>
    </div>
  );
}

