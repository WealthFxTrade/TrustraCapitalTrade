import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, ShieldCheck } from 'lucide-react';
import { UserContext } from '../context/UserContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardHeader() {
  const { stats, loading } = useContext(UserContext);
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

  // Logout handler
  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Safe data extraction from contexts
  const displayName = user?.fullName || user?.name || "Investor";
  const plan = stats?.activePlan || "Standard Node";
  const mainBalance = stats?.mainBalance || 0;

  // Generate initials
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-4 rounded-2xl border border-slate-800 shadow-xl sticky top-4 z-50 mx-4 sm:mx-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Section: User Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/10">
            {initials}
          </div>
          <div>
            <h1 className="text-white font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
              Welcome, {displayName}
              {user?.role === 'admin' && <ShieldCheck size={14} className="text-blue-500" />}
            </h1>
            <p className="text-slate-400 text-[10px] sm:text-xs uppercase font-black tracking-widest flex items-center gap-2">
              {plan} • <span className="text-emerald-400">€{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Right Section: Dropdown Action */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-bold transition-all"
          >
            <span className="hidden sm:inline uppercase tracking-widest">Account</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/5 rounded-xl transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-blue-500" /> Profile & Settings
                </Link>
                
                <div className="h-px bg-slate-800 mx-2 my-1" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 rounded-xl transition"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

