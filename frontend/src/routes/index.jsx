import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import DashboardPage from '../pages/DashboardPage';
import KYC from '../pages/KYC';
import InvestPage from '../pages/InvestPage';
import NotFoundPage from '../pages/NotFoundPage';

export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
];

export const protectedRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/kyc', element: <KYC /> },
  { path: '/invest', element: <InvestPage /> },
];

export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};
