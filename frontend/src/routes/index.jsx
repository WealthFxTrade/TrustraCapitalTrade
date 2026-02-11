import React from 'react';
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';

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

export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
];

export const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/kyc', element: <KYC /> },
  { path: '/invest', element: <Invest /> },
  { path: '/deposit', element: <Deposit /> },
  { path: '/withdraw', element: <Withdraw /> },
  { path: '/profile', element: <Profile /> },
  { path: '/admin', element: <Admin /> },
];

export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};

