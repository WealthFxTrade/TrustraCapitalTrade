import React from 'react';
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';

// ✅ NEW IMPORTS: Added these to match your Navbar buttons
import Plans from '../pages/Plans'; 
import Reviews from '../pages/Reviews'; // Note: Ensure you created this file as discussed!

// ✅ FIXED: Explicit path to the file inside the Dashboard folder
import Dashboard from '../pages/Dashboard/Dashboard';

// ✅ Standardized Page Imports
import KYC from '../pages/KYC';
import Invest from '../pages/Invest';
import Deposit from '../pages/Deposit';
import Withdraw from '../pages/Withdraw';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Public Routes: Accessible by everyone
 */
export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  
  // ✅ FIXED: Added these so the Navbar buttons don't return 404
  { path: '/plans', element: <Plans /> },
  { path: '/reviews', element: <Reviews /> },
];

/**
 * Protected Routes: Only accessible after Login
 */
export const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/kyc', element: <KYC /> },
  { path: '/invest', element: <Invest /> },
  { path: '/deposit', element: <Deposit /> },
  { path: '/withdraw', element: <Withdraw /> },
  { path: '/profile', element: <Profile /> },
  { path: '/admin', element: <Admin /> },
];

/**
 * Fallback: Catch-all for undefined paths
 */
export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};

