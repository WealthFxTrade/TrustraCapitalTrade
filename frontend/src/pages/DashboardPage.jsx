import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, 
  LogOut, User as UserIcon, ShieldCheck 
} from 'lucide-react';

export default function DashboardHeader({ user, balances, plan, dailyRate, logout, currency = "€" }) {
  // Total balance in EUR (we assume USD converted to € or just use balances.USD)
  const totalBalance = balances?.USD || 0;

  return (
    <nav className="bg-[#0a0d14] border-b border-white/5 px-6 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto py-4">
        {/* Top Row: Brand & Profile */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <span className="font-black italic uppercase tracking-tighter text-lg">Trustra</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">
                Node: {plan}
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-tighter">
                {user?.fullName}
              </span>
            </div>
            <button 
              onClick={logout}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 group transition-all"
              title="Secure Logout"
            >
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Balance & Growth */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Command Balance */}
            <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Command Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono">
                  {currency}{totalBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {/* Optional: show BTC & USDT */}
              <p className="text-[8px] text-slate-400 mt-1">
                BTC: {balances?.BTC ?? 0} | USDT: {balances?.USDT ?? 0}
              </p>
            </div>
            
            {/* Daily Yield */}
            <div className="hidden sm:block">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Daily Yield</p>
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp size={14} />
                <span className="text-lg font-black">+{dailyRate}%</span>
              </div>
            </div>
          </div>

          {/* Actions: Deposit & Withdraw */}
          <div className="flex gap-2 w-full md:w-auto">
            <Link 
              to="/deposit" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-blue-600/20"
            >
              <ArrowDownCircle size={14} /> Deposit
            </Link>
            <Link 
              to="/withdraw" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
            >
              <ArrowUpCircle size={14} /> Withdraw
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
