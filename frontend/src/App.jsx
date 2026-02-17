import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import LoadingScreen from './components/LoadingScreen';
import ProtectedLayout from './layouts/ProtectedLayout';
import { publicRoutes, protectedRoutes, adminRoutes } from './routes';

export default function App() {
  const { isReady, user, systemStatus } = useAuth(); // systemStatus added to context
  const location = useLocation();

  if (!isReady) {
    return <LoadingScreen message="Securing Trustra Node..." />;
  }

  // 🛡️ MAINTENANCE MODE OVERRIDE
  // If maintenance is ON and the user is NOT an admin, block access.
  if (systemStatus?.maintenanceMode && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center selection:bg-red-500/30">
        <div className="max-w-md space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] mx-auto flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/10">
            <ShieldAlert size={48} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              System <span className="text-red-500">/</span> Offline
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
              The Trustra Node Network is currently undergoing a 
              <span className="text-white"> Scheduled Protocol Upgrade</span>.
            </p>
          </div>
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
             <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">
               Capital remains <span className="text-emerald-500">fully secured</span> in cold storage. 
               The terminal will resume shortly.
             </p>
          </div>
          <div className="pt-6 border-t border-white/5">
             <p className="text-[10px] font-mono text-slate-700 uppercase">Error_Code: 503_NODE_MAINTENANCE</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes location={location} key={location.pathname}>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={
          user && (route.path === '/login' || route.path === '/register') 
            ? <Navigate to="/dashboard" replace /> 
            : route.element
        } />
      ))}

      <Route element={user ? <ProtectedLayout /> : <Navigate to="/login" replace state={{ from: location }} />}>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route element={(user && user.role === 'admin') ? <ProtectedLayout /> : <Navigate to="/" replace />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

