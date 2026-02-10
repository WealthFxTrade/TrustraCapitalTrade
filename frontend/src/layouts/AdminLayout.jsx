import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, initialized } = useAuth();
  const location = useLocation();

  // 1. Security Guard: Ensure only admins can enter
  if (!initialized) return null; // Wait for auth init
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Nodes', path: '/admin/users', icon: Users },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0a0d14] border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
            <ShieldCheck className="h-8 w-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
            <div>
              <span className="block text-lg font-black uppercase italic tracking-tighter">Trustra</span>
              <span className="block text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Admin Node</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-indigo-400'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden p-6 bg-[#0a0d14] border-b border-white/5 flex justify-between items-center">
          <ShieldCheck className="text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
          <button onClick={logout} className="text-red-500"><LogOut size={18} /></button>
        </div>

        <div className="max-w-6xl mx-auto">
          <Outlet /> {/* This is where the Admin pages (Overview, Withdrawals) render */}
        </div>
      </main>
    </div>
  );
}

