import React from 'react';

// Use the good landing component
import Landing from '../components/landing/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';

// Dashboard & core pages
import Dashboard from '../pages/Dashboard/Dashboard';
import KYC from '../pages/Dashboard/KYC';
import Invest from '../pages/Dashboard/Invest';
import Withdraw from '../pages/Dashboard/Withdraw';
import Profile from '../pages/Dashboard/Profile';

// Admin pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManager from '../pages/Admin/UserManager';
import WithdrawalManagement from '../pages/Admin/WithdrawalManagement';
import AuditLogs from '../pages/Admin/AuditLogs';
import AdminSecurityLogs from '../pages/Admin/AdminSecurityLogs';

import NotFoundPage from '../pages/NotFoundPage';

// Public routes (no auth required)
export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
];

// Protected routes (require login)
export const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/kyc', element: <KYC /> },
  { path: '/invest', element: <Invest /> },
  { path: '/withdraw', element: <Withdraw /> },
  { path: '/profile', element: <Profile /> },
];

// Admin-only routes
export const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/users', element: <UserManager /> },
  { path: '/admin/withdrawals', element: <WithdrawalManagement /> },
  { path: '/admin/audit', element: <AuditLogs /> },
  { path: '/admin/security', element: <AdminSecurityLogs /> },
];

export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};
