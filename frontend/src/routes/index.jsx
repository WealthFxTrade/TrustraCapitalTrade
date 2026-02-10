import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import DashboardPage from '../pages/DashboardPage';
import KYC from '../pages/KYC';
import InvestPage from '../pages/InvestPage';
import NotFoundPage from '../pages/NotFoundPage';

export const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Signup /> },
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
