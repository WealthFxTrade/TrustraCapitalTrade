import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context & Hooks
import { useAuth } from "./context/AuthContext.jsx";

// Guards & Layouts
import GuestGuard from "./components/GuestGuard.jsx";
import ProtectedLayout from "./components/ProtectedLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Loading Components
import LoadingScreen from "./components/LoadingScreen.jsx";

// Pages
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import Invest from "./pages/Invest.jsx";
import DepositPage from "./pages/DepositPage.jsx";
import WithdrawalPage from "./pages/WithdrawalPage.jsx";
import ProfilePage from "./pages/Profile.jsx";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminWithdrawals from "./pages/AdminWithdrawals.jsx";
import Users from "./pages/admin/Users.jsx";

export default function App() {
  const { initialized } = useAuth();

  // 1️⃣ Wait for AuthContext to initialize before rendering routes
  if (!initialized) {
    return <LoadingScreen message="Initializing Trustra Security..." />;
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-50 selection:bg-blue-500/30">
      {/* Global Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#0a0d14",
            color: "#fff",
            border: "1px solid #1e293b",
            fontSize: "12px",
            fontWeight: "bold",
          },
        }}
      />

      <Suspense fallback={<LoadingScreen message="Syncing Nodes..." />}>
        <Routes>
          {/* 2️⃣ PUBLIC ROUTES */}
          <Route path="/" element={<Landing />} />

          {/* 3️⃣ GUEST ONLY */}
          <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><Signup /></GuestGuard>} />
          <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
          <Route path="/reset-password/:token" element={<GuestGuard><ResetPassword /></GuestGuard>} />

          {/* 4️⃣ PROTECTED USER ROUTES */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 5️⃣ ADMIN ROUTES */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          </Route>

          {/* 6️⃣ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
