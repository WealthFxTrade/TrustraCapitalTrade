// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Guards & Layout
import AuthGuard from "./components/AuthGuard.jsx";
import GuestGuard from "./components/GuestGuard.jsx";
import ProtectedLayout from "./components/ProtectedLayout.jsx";

// Loading
import LoadingScreen from "./components/LoadingScreen.jsx";

// Pages
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import Invest from "./pages/Invest.jsx";
import DepositPage from "./pages/DepositPage.jsx";
import WithdrawalPage from "./pages/WithdrawalPage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminWithdrawals from "./pages/AdminWithdrawals.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-50 selection:bg-blue-500/30">
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

      <Suspense fallback={<LoadingScreen message="Loading app..." />}>
        <Routes>
          {/* 1️⃣ PUBLIC */}
          <Route path="/" element={<Landing />} />

          {/* 2️⃣ GUEST ONLY */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <Login />
              </GuestGuard>
            }
          />
          <Route
            path="/register"
            element={
              <GuestGuard>
                <Signup />
              </GuestGuard>
            }
          />

          {/* 3️⃣ PROTECTED USER ROUTES */}
          <Route element={<ProtectedLayout />}>
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <DashboardPage />
                </AuthGuard>
              }
            />
            <Route
              path="/invest"
              element={
                <AuthGuard>
                  <Invest />
                </AuthGuard>
              }
            />
            <Route
              path="/deposit"
              element={
                <AuthGuard>
                  <DepositPage />
                </AuthGuard>
              }
            />
            <Route
              path="/withdraw"
              element={
                <AuthGuard>
                  <WithdrawalPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
          </Route>

          {/* 4️⃣ ADMIN ROUTES */}
          <Route element={<ProtectedLayout adminOnly />}>
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <AdminPanel />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/withdrawals"
              element={
                <AuthGuard>
                  <AdminWithdrawals />
                </AuthGuard>
              }
            />
          </Route>

          {/* 5️⃣ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
