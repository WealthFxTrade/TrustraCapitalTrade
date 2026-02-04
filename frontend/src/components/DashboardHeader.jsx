import React from 'react';
import { LogOut, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardHeader({ user, balance, plan, dailyRate, logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Identity */}
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold text-white tracking-tight">TrustraCapital</span>
          </Link>

          {/* Live Portfolio Stats (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-8 border-x border-slate-800 px-8 h-full">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Balance</p>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-400" />
                <span className="font-mono font-bold text-white">
                  ${(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Plan</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-200">{plan || 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Verified Account</p>
              <p className="text-sm font-medium text-slate-200">{user?.fullName || 'Investor'}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20 transition border border-red-500/20"
            >
              <LogOut className="h-4 w-4" /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

