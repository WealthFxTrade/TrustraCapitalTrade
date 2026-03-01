import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, PieChart, RefreshCw, ArrowDownCircle,
  ArrowUpCircle, ShieldCheck, Settings, LogOut, Menu, X, 
  ShieldAlert, Activity, Zap, User, ChevronRight
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Node Tiers', path: '/plans', icon: Zap },
    { label: 'Investment', path: '/invest', icon: PieChart },
    { label: 'Exchange', path: '/exchange', icon: RefreshCw },
    { label: 'Deposit', path: '/deposit', icon: ArrowDownCircle },
    { label: 'Withdraw', path: '/withdraw', icon: ArrowUpCircle },
    { label: 'Compliance', path: '/kyc', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 flex overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* 1. Grainy Overlay - Fixed z-index to not block clicks */}
      <div className="bg-grain fixed inset-0 pointer-events-none z-[100] opacity-10" />

      {/* 2. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#05070a] border-r border-white/5 sticky top-0 h-screen overflow-y-auto z-[60]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:rotate-12 transition-all">
              <Zap className="text-black fill-current" size={20} />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">
              Trustra<span className="text-yellow-500">Trade</span>
            </h1>
          </div>

          <nav className="space-y-1.5">
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 px-4 italic">Core Protocol</p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/10 italic'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={isActive(item.path) ? 'text-black' : 'text-slate-600 group-hover:text-yellow-500 transition-colors'} />
                  {item.label}
                </div>
                {isActive(item.path) && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            ))}

            {/* Admin Bypass */}
            {user?.role === 'admin' && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <Link
                  to="/admin"
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${
                    isActive('/admin') ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5'
                  }`}
                >
                  <ShieldAlert size={18} /> Admin Terminal
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-2">
          <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest italic">
            <User size={16} /> Identity Node
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all tracking-widest italic">
            <LogOut size={16} /> Terminate
          </button>
        </div>
      </aside>

      {/* 3. Main Display Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <header className="h-24 flex items-center justify-between px-6 lg:px-12 bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-3 bg-white/5 rounded-xl text-yellow-500 hover:bg-yellow-500/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <Activity size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/80 italic">Network Stable</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end text-right">
              <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest italic leading-none mb-1">Session Node</span>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[120px] md:max-w-[200px]">
                {user?.email}
              </span>
            </div>
            <div 
              onClick={() => navigate('/profile')}
              className={`h-11 w-11 rounded-xl border flex items-center justify-center font-black italic cursor-pointer hover:scale-105 transition-all ${
                user?.kycStatus === 'verified' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
              }`}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* 🛰️ ROUTE OUTLET: Where the Dashboard/Invest pages appear */}
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. Mobile Navigation Hub */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#020408] p-8 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-500" size={32} />
              <span className="font-black italic uppercase tracking-tighter text-2xl">Trustra</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-white/5 rounded-2xl text-white active:scale-95 transition-transform">
              <X size={24} />
            </button>
          </div>
          
          <nav className="grid grid-cols-1 gap-3 overflow-y-auto">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-6 p-6 rounded-[2rem] text-sm font-black uppercase italic tracking-widest transition-all ${
                  isActive(item.path) ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white'
                }`}
              >
                <item.icon size={24} /> {item.label}
              </Link>
            ))}
          </nav>

          <button 
            onClick={handleLogout} 
            className="mt-auto w-full p-8 text-rose-500 font-black uppercase italic tracking-[0.3em] border border-rose-500/10 rounded-[2.5rem] hover:bg-rose-500/5"
          >
            Disconnect Session
          </button>
        </div>
      )}
    </div>
  );
}
