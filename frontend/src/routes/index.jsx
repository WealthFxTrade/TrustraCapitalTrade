import React from 'react';
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';

// ✅ NEW IMPORTS: Navigation & Public Pages
import Plans from '../pages/Plans';
import Reviews from '../pages/Reviews';

// ✅ DASHBOARD & CORE
import Dashboard from '../pages/Dashboard/Dashboard';

// ✅ PROTECTED PAGES
import KYC from '../pages/KYC';
import Invest from '../pages/Invest';
import Deposit from '../pages/Deposit';
import Withdraw from '../pages/Withdraw';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import NotFoundPage from '../pages/NotFoundPage';

// ✅ ADDED FOR SIDEBAR: Wallet Exchange & Schema Logs
import WalletExchange from '../pages/WalletExchange'; 
import Investments from '../pages/Invest'; // Using Invest page as Schema Logs or create a separate one

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
  { path: '/admin', element: <Admin /> },
  
  // ✅ FIXED: Added these to match your new Sidebar buttons
  { path: '/exchange', element: <WalletExchange /> },
  { path: '/investments', element: <Investments /> },
  { path: '/transactions', element: <Deposit /> }, // Pointing to a transaction history page
];

/**
 * Fallback: Catch-all for undefined paths
 */
export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};

