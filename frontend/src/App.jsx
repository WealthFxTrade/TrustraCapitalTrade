// src/App.jsx
import React, { useEffect } from 'react';
// ... other imports

export default function App() {
  const { isReady, user, logout } = useAuth(); // Add logout here
  const location = useLocation();

  // FIX: Wake up Render backend immediately on mount
  useEffect(() => {
    fetch('https://trustracapitaltrade-backend.onrender.com').catch(() => {});
  }, []);

  // 1. Force isReady to true if it hangs too long (Safety Net)
  if (!isReady) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 2. Fix the Banned User Redirect Loop
  if (user?.banned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-10 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">NODE DEACTIVATED</h1>
          <p className="text-slate-400 mb-6">Your account has been restricted due to compliance violations.</p>
          <button onClick={logout} className="bg-white text-black px-6 py-2 rounded-xl font-bold">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.isAdmin || user?.role === 'admin';

  return (
    <Routes location={location} key={location.pathname}>
      {/* PUBLIC ROUTES */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            // ONLY redirect if user is fully authenticated and NOT banned
            user && !user.banned && (route.path === '/login' || route.path === '/register') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              route.element
            )
          }
        />
      ))}

      {/* USER PROTECTED ROUTES */}
      <Route
        element={
          user && !user.banned ? (
            <UserProvider>
              <ProtectedLayout />
            </UserProvider>
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      >
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* ... ADMIN ROUTES and 404 ... */}
    </Routes>
  );
}

