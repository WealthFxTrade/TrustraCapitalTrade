// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Activity,
  Zap,
  User,
  ChevronRight,
  Settings
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define Menu Items based on Role
  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin ? [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: User },
    { label: 'Withdrawal Req', path: '/admin/withdrawals', icon: ArrowUpCircle },
    { label: 'Deposit Req', path: '/admin/deposits', icon: ArrowDownCircle },
    { label: 'KYC Verification', path: '/admin/kyc', icon: ShieldCheck },
    { label: 'System Health', path: '/admin/health', icon: Activity },
    { label: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deposit Funds', path: '/dashboard/deposit', icon: ArrowDownCircle },
    { label: 'Withdraw Funds', path: '/dashboard/withdrawal', icon: ArrowUpCircle },
    { label: 'Transaction Ledger', path: '/dashboard/ledger', icon: RefreshCw },
    { label: 'Account Profile', path: '/dashboard/profile', icon: User },
  ];

  // UI Branding Colors
  const accentColor = isAdmin ? 'rose-500' : 'yellow-500';
  const accentBg = isAdmin ? 'bg-rose-500' : 'bg-yellow-500';
  const shadowColor = isAdmin ? 'shadow-rose-500/20' : 'shadow-yellow-500/20';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 flex overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* 1. Grainy Overlay */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-10" />

      {/* 2. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#05070a] border-r border-white/5 sticky top-0 h-screen overflow-y-auto z-[60]">
        <div className="p-8">
          <div 
            className="flex items-center gap-3 mb-12 cursor-pointer group"
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
          >
            <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shadow-lg ${shadowColor} group-hover:rotate-12 transition-all`}>
              <Zap className="text-black fill-current" size={20} />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">
              Trustra<span className={`text-${accentColor}`}>{isAdmin ? 'Admin' : 'Trade'}</span>
            </h1>
          </div>

          <nav className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4 italic">
              {isAdmin ? 'Management Protocol' : 'Core Protocol'}
            </p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                  isActive(item.path)
                    ? `${accentBg} text-black shadow-xl italic`
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    size={18}
                    className={isActive(item.path) ? 'text-black' : 'text-slate-600 group-hover:text-white transition-colors'}
                  />
                  {item.label}
                </div>
                {isActive(item.path) && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all tracking-widest italic"
          >
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* 3. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <header className="h-24 flex items-center justify-between px-6 lg:px-12 bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white/5 rounded-xl text-yellow-500 active:scale-90 transition-all"
            >
              <Menu size={20} />
            </button>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <Activity size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/80 italic">System Synchronized</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest italic leading-none mb-1">
                {isAdmin ? 'Admin Clearance' : 'Active Node'}
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[150px]">
                {user?.email}
              </span>
            </div>
            <div
              onClick={() => navigate(isAdmin ? '/admin/settings' : '/dashboard/profile')}
              className={`h-11 w-11 rounded-xl border flex items-center justify-center font-black italic cursor-pointer hover:scale-105 transition-all ${
                isAdmin ? 'border-rose-500/20 text-rose-500 bg-rose-500/5' : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
              }`}
            >
              {isAdmin ? 'AD' : (user?.username?.charAt(0).toUpperCase() || 'U')}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. Mobile Full-Screen Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020408] p-8 flex flex-col animate-in slide-in-from-left duration-300">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <Zap className={`text-${accentColor}`} size={32} />
              <span className="font-black italic uppercase tracking-tighter text-2xl text-white">Trustra</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 bg-white/5 rounded-2xl text-white"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-6 p-6 rounded-[2rem] text-sm font-black uppercase italic tracking-widest transition-all ${
                  isActive(item.path) ? `${accentBg} text-black` : 'bg-white/5 text-white'
                }`}
              >
                <item.icon size={24} /> {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full p-8 text-rose-500 font-black uppercase italic tracking-[0.3em] border border-rose-500/10 rounded-[2.5rem]"
          >
            Terminate Session
          </button>
        </div>
      )}
    </div>
  );
}
