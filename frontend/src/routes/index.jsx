import React from 'react';
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Plans from '../pages/Plans';
import Reviews from '../pages/Reviews';

// DASHBOARD & CORE
import Dashboard from '../pages/Dashboard/Dashboard';
import KYC from '../pages/KYC';
import Invest from '../pages/Invest';
import Deposit from '../pages/Deposit';
import Withdraw from '../pages/Withdraw';
import Profile from '../pages/Profile';
import WalletExchange from '../pages/WalletExchange';
import NotFoundPage from '../pages/NotFoundPage';

// ADMIN PAGES
import Admin from '../pages/Admin';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManager from '../pages/Admin/UserManager';
import WithdrawalManagement from '../pages/Admin/WithdrawalManagement';
import AuditLogs from '../pages/Admin/AuditLogs';
import AdminSecurityLogs from '../pages/Admin/AdminSecurityLogs';

/**
 * Public Routes: Accessible by everyone
 */
export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/plans', element: <Plans /> },
  { path: '/reviews', element: <Reviews /> },
];

/**
 * Protected Routes: Accessible only after Login
 */
export const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/kyc', element: <KYC /> },
  { path: '/invest', element: <Invest /> },
  { path: '/deposit', element: <Deposit /> },
  { path: '/withdraw', element: <Withdraw /> },
  { path: '/profile', element: <Profile /> },
  { path: '/exchange', element: <WalletExchange /> },
  { path: '/investments', element: <Invest /> },
  { path: '/transactions', element: <Deposit /> }, 
];

/**
 * Admin Routes: Separated for App.jsx import
 * This fixes the "adminRoutes is not exported" error
 */
export const adminRoutes = [
  { path: '/admin', element: <Admin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/users', element: <UserManager /> },
  { path: '/admin/withdrawals', element: <WithdrawalManagement /> },
  { path: '/admin/audit', element: <AuditLogs /> },
  { path: '/admin/security', element: <AdminSecurityLogs /> },
];

/**
 * Fallback Route
 */
export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};
