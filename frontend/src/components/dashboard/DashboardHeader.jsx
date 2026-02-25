import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, X, LogOut, User, ShieldCheck, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// Accept 'stats' and 'loading' as props from the parent Dashboard
export default function DashboardHeader({ stats, loading: statsLoading }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout(); 
    // AuthContext handles the redirect, but navigate('/login') is a safe backup
    navigate('/login');
  };

  // Safe data extraction
  const displayName = user?.fullName || user?.name || 'Investor';
  const plan = stats?.activePlan || 'Standard Node';
  const mainBalance = stats?.mainBalance || 0;
  
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-slate-900/40 backdrop-blur-xl px-4 sm:px-8 py-4 rounded-[2rem] border border-white/5 shadow-2xl sticky top-6 z-[100] transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LEFT: USER PROFILE BUBBLE */}
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="min-w-[44px] w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black font-black text-lg shadow-lg border border-yellow-400/20">
            {initials}
          </div>
          <div className="truncate">
            <h1 className="text-white font-black text-sm uppercase tracking-tighter flex items-center gap-2 truncate">
              {displayName}
              {user?.role === 'admin' && <ShieldCheck size={14} className="text-yellow-500 shrink-0" />}
            </h1>
            <div className="text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] flex items-center gap-2">
              {statsLoading ? (
                <span className="flex items-center gap-1 text-blue-500 animate-pulse">
                  <Activity size={10} /> Syncing Nodes...
                </span>
              ) : (
                <>
                  <span className="truncate text-white/40">{plan}</span>
                  <span className="text-emerald-400 font-mono">
                    €{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: MENU TOGGLE */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex items-center gap-3 px-5 py-2.5 border rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
              menuOpen
                ? 'bg-yellow-600 border-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            {menuOpen ? <X size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* DROPDOWN MENU */}
          {menuOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-[#0a0f1e] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 hover:bg-white/5 rounded-2xl transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <TrendingUp size={16} className="text-yellow-600" /> Command Center
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-yellow-500 hover:bg-white/5 rounded-2xl transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} className="text-yellow-600" /> Security & Identity
                </Link>
                
                <div className="h-px bg-white/5 mx-2 my-3" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl text-left transition"
                >
                  <LogOut size={16} /> Terminate Session
                </button>
              </div>
              <div className="bg-black/40 p-4 text-center border-t border-white/5">
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">
                  Trustra Secure Gateway v8.4.1
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

