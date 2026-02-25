import React from 'react';
import { ShieldCheck, Mail, Activity, ArrowUpRight } from 'lucide-react';

export default function AccountSummary({ user }) {
  // Prevent crash if user data is still fetching
  if (!user) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] animate-pulse h-64 shadow-2xl" />
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Investor';

  // Support for both BTC and EUR (Trustra default)
  const formatCurrency = (currency, amount) => {
    const num = Number(amount || 0);
    if (currency === 'BTC') return `₿${num.toFixed(8)}`;
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(num);
  };

  return (
    <div className="relative group bg-[#0a0f1e] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all hover:border-yellow-500/20">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 via-yellow-600 to-transparent opacity-50" />
      
      <div className="relative z-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase italic">
              System Ready, {firstName} <ShieldCheck size={20} className="text-yellow-500" />
            </h2>
            <div className="flex items-center gap-3 mt-2">
               <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Mail size={12} className="text-yellow-500/50" /> {user.email}
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em]">
              Node Verified
            </span>
          </div>
        </div>

        {/* BALANCE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {/* Ensure balances exists before mapping */}
          {Object.entries(user.balances || { EUR: 0, BTC: 0 }).map(([currency, amount]) => (
            <div key={currency} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                {currency} Assets
              </p>
              <p className="text-lg font-black text-white font-mono tracking-tighter">
                {formatCurrency(currency, amount)}
              </p>
            </div>
          ))}
        </div>

        {/* RECENT ACTIVITY SLICE */}
        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
             <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
              <Activity size={12} className="text-yellow-500" /> Recent Node Activity
            </p>
            <ArrowUpRight size={14} className="text-white/10" />
          </div>
          
          <div className="space-y-3">
            {(user.ledger || []).slice(0, 2).map((tx, idx) => (
              <div key={tx._id || idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex flex-col">
                  <span className="text-white font-black uppercase text-[10px] tracking-widest">{tx.type}</span>
                  <span className="text-white/20 text-[8px] font-bold uppercase">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`text-[11px] font-black font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-rose-500"}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} {tx.currency || 'EUR'}
                </span>
              </div>
            ))}
            
            {(!user.ledger || user.ledger.length === 0) && (
              <p className="text-[10px] text-white/20 italic uppercase tracking-widest py-2">
                No recent transactions indexed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

