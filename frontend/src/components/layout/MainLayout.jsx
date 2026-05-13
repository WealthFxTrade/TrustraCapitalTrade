// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
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
  Settings,
  RefreshCw,
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Menu items based on role
  const menuItems = isAdmin ? [
    { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: User },
    { label: 'Withdrawal Requests', path: '/admin/withdrawals', icon: ArrowUpCircle },
    { label: 'Deposit Requests', path: '/admin/deposits', icon: ArrowDownCircle },
    { label: 'KYC Verification', path: '/admin/kyc', icon: ShieldCheck },
    { label: 'System Health', path: '/admin/health', icon: Activity },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deposit Funds', path: '/dashboard/deposit', icon: ArrowDownCircle },
    { label: 'Withdraw Funds', path: '/dashboard/withdrawal', icon: ArrowUpCircle },
    { label: 'Transaction Ledger', path: '/dashboard/ledger', icon: RefreshCw },
    { label: 'Account Profile', path: '/dashboard/profile', icon: User },
  ];

  const accentColor = isAdmin ? 'rose' : 'emerald';
  const accentBg = isAdmin ? 'bg-rose-500' : 'bg-emerald-500';

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to terminate this session?')) return;
    
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 flex overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#05070a] border-r border-white/5 sticky top-0 h-screen overflow-y-auto z-50">
        <div className="p-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 mb-12 cursor-pointer group"
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
          >
            <div className={`w-10 h-10 \( {accentBg} rounded-2xl flex items-center justify-center shadow-lg shadow- \){accentColor}-500/30 group-hover:rotate-12 transition-transform`}>
              <Zap className="text-black" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                Trustra <span className={`text-${accentColor}`}>{isAdmin ? 'Admin' : 'Capital'}</span>
              </h1>
              <p className="text-[10px] text-gray-500 -mt-1">Institutional Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] mb-6 px-4">
              {isAdmin ? 'MANAGEMENT PROTOCOL' : 'CORE PROTOCOL'}
            </p>

            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive(item.path)
                    ? `${accentBg} text-black shadow-xl`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon 
                    size={20} 
                    className={isActive(item.path) ? 'text-black' : 'text-slate-500 group-hover:text-white'} 
                  />
                  {item.label}
                </div>
                {isActive(item.path) && <ChevronRight size={16} className="opacity-70" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="mt-auto p-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-[#020408]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white/5 rounded-xl text-white"
            >
              <Menu size={22} />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Live • Synchronized</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user?.name || 'Investor'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <div
              onClick={() => navigate(isAdmin ? '/admin/settings' : '/dashboard/profile')}
              className={`h-10 w-10 rounded-2xl border flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition-all ${
                isAdmin 
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' 
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {isAdmin ? 'A' : (user?.name?.[0]?.toUpperCase() || 'U')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020408] p-6 flex flex-col lg:hidden">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <Zap size={32} className="text-emerald-500" />
              <span className="font-black text-3xl tracking-tighter">Trustra</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3">
              <X size={28} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-5 rounded-3xl text-lg font-medium transition-all ${
                  isActive(item.path) ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white'
                }`}
              >
                <item.icon size={24} />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full py-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold rounded-3xl flex items-center justify-center gap-3"
          >
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      )}
    </div>
  );
}
