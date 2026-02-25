import React from 'react';
import { ShieldCheck, Mail, Activity } from 'lucide-react';

export default function AccountSummary({ user, stats }) {
  if (!user) return null;
  const firstName = user?.fullName?.split(' ')[0] || 'Investor';
  const formatCurrency = (currency, amount) => {
    const num = Number(amount || 0);
    return currency === 'BTC' ? `₿${num.toFixed(8)}` : `€${num.toFixed(2)}`;
  };

  return (
    <div className="glass-card p-8 h-full flex flex-col justify-between border-l-4 border-l-blue-500">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Welcome back, {firstName}! <ShieldCheck size={18} className="text-blue-500" />
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
              <Mail size={12} /> {user.email}
            </p>
          </div>
          <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {Object.entries(user.balances || {}).map(([currency, amount]) => (
            <div key={currency} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{currency}</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(currency, amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Activity size={12} className="text-blue-500" /> Recent Node Activity
        </p>
        <div className="space-y-2">
          {(user.ledger || []).slice(0, 2).map((tx, idx) => (
            <div key={tx._id || idx} className="flex items-center justify-between text-[10px]">
              <span className="text-slate-300 font-bold uppercase">{tx.type}</span>
              <span className="text-slate-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</span>
              <span className={tx.amount > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {tx.amount > 0 ? '+' : ''}
                {tx.amount} {tx.currency}
              </span>
            </div>
          ))}
          {(!user.ledger || user.ledger.length === 0) && (
            <p className="text-[10px] text-slate-600 italic">No recent transactions indexed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
