// src/pages/Dashboard/AccountSummary.jsx
/**
 * Trustra Capital Trade - Account Summary Component
 * Fully unshortened version reading from unified data streams
 */

import React, { useMemo } from 'react';
import { ShieldCheck, Mail, Activity, ArrowUpRight } from 'lucide-react';

export default function AccountSummary({ user, stats }) {
  // Gracefully construct fallback loops if the authentication layer is loading
  const resolvedUser = user?.user || user || {};
  const firstName = resolvedUser?.name?.split(' ')[0] || 'Investor';
  
  // UNIFICATION LAYER: Fall back to stats telemetry if user object balances are blank
  const rawBalances = resolvedUser?.balances || stats?.balances || stats || {};

  // Universal Currency String Token Output Formatter
  const formatCurrency = (currency, amount) => {
    const num = Number(amount || 0);
    if (currency === 'BTC') return `₿${num.toFixed(8)}`;
    if (currency === 'ETH') return `${num.toFixed(8)} ETH`;
    if (currency === 'USDT') return `${num.toLocaleString('de-DE', { minimumFractionDigits: 2 })} USDT`;
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  // Direct Extraction assignments matching seed data key metrics
  const availableCapital = Number(rawBalances.EUR || 0);
  const investedCapital = Number(rawBalances.INVESTED || 0);
  const totalProfit = Number(rawBalances.TOTAL_PROFIT || 0);

  // Pure cryptographic blockchain network asset loop extraction filter
  const cryptoAssets = useMemo(() => {
    return Object.entries(rawBalances).filter(([key]) => 
      ['BTC', 'ETH', 'USDT'].includes(key)
    );
  }, [rawBalances]);

  return (
    <div className="relative group bg-[#0a0f1e] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all hover:border-yellow-500/20 w-full">
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
                <Mail size={12} className="text-yellow-500/50" /> {resolvedUser.email || 'gery.maes1@telenet.be'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em]">
              Node Verified
            </span>
          </div>
        </div>

        {/* FINANCIAL PROTOCOL METRIC HIGHLIGHT PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
              Available Capital
            </p>
            <p className="text-2xl font-black text-white font-mono tracking-tighter">
              {formatCurrency('EUR', availableCapital)}
            </p>
          </div>
          
          <div className="bg-black/20 p-5 rounded-2xl border border-white/5 border-emerald-500/10">
            <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
              Accrued Profit
            </p>
            <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
              {formatCurrency('EUR', totalProfit)}
            </p>
          </div>
          
          <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
              Principal Invested
            </p>
            <p className="text-2xl font-black text-white font-mono tracking-tighter">
              {formatCurrency('EUR', investedCapital)}
            </p>
          </div>
        </div>

        {/* CRYPTO BLOCKCHAIN PORTFOLIO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {cryptoAssets.map(([currency, amount]) => (
            <div key={currency} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                {currency} Core Pool Asset
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
            {(resolvedUser.ledger || resolvedUser.transactions || stats?.transactions || []).slice(0, 3).map((tx, idx) => (
              <div key={tx._id || idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex flex-col">
                  <span className="text-white font-black uppercase text-[10px] tracking-widest">
                    {tx.type || 'System Sync Transaction'}
                  </span>
                  <span className="text-white/20 text-[8px] font-bold uppercase">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('de-DE') : 'Processed'}
                  </span>
                </div>
                <span className={`text-[11px] font-black font-mono ${Number(tx.amount || 0) > 0 ? "text-emerald-400" : "text-rose-500"}`}>
                  {Number(tx.amount || 0) > 0 ? '+' : ''}{Number(tx.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} {tx.currency || 'EUR'}
                </span>
              </div>
            ))}

            {(!resolvedUser.ledger && !resolvedUser.transactions && !stats?.transactions || 
              (resolvedUser.ledger?.length === 0 && resolvedUser.transactions?.length === 0)) && (
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
