import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, ShieldCheck, TrendingUp, Menu, X } from 'lucide-react';
import { UserContext } from '../context/UserContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHeader() {
  // Access contexts with fallbacks to prevent "Black Screen" crashes
  const userContext = useContext(UserContext) || {};
  const { stats, loading: statsLoading } = userContext;
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Safe data extraction
  const displayName = user?.fullName || user?.name || "Investor";
  const plan = stats?.activePlan || "Standard Node";
  const mainBalance = stats?.mainBalance || 0;

  // Generate initials for the avatar
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md px-4 sm:px-10 py-4 rounded-2xl border border-slate-800 shadow-2xl sticky top-4 z-[100] mx-4 sm:mx-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Section: Branding & Profile Sync */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="min-w-[40px] w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/10">
            {initials}
          </div>
          <div className="truncate">
            <h1 className="text-white font-bold text-sm sm:text-lg tracking-tight flex items-center gap-2 truncate">
              {displayName}
              {user?.role === 'admin' && <ShieldCheck size={14} className="text-blue-500 shrink-0" />}
            </h1>
            <p className="text-slate-400 text-[9px] sm:text-xs uppercase font-black tracking-widest flex items-center gap-2">
              {statsLoading ? (
                <span className="animate-pulse text-blue-500">Syncing...</span>
              ) : (
                <>
                  <span className="truncate">{plan}</span>
                  <span className="text-emerald-400 font-mono">€{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Section: Interactive Account Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border rounded-xl text-white text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
              menuOpen ? 'bg-blue-600 border-blue-500 shadow-blue-500/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {/* "MENU" label added to mobile to prevent confusion with generic 3 lines */}
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            {menuOpen ? <X size={14} /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Dropdown Menu (Z-Index fix for Mobile) */}
          {menuOpen && (
            <div className="absolute right-0 mt-4 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/5 rounded-xl transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/5 rounded-xl transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-blue-500" /> Profile & Security
                </Link>
                
                <div className="h-px bg-slate-800 mx-2 my-2" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 rounded-xl transition text-left"
                >
                  <LogOut className="h-4 w-4" /> Terminate Session
                </button>
              </div>
              
              {/* Optional footer for the menu */}
              <div className="bg-slate-950/50 p-3 text-center border-t border-slate-800">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Trustra Secure Gateway v8.4.1</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

