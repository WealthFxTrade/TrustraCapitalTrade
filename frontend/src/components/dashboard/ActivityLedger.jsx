import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Fingerprint,
  TrendingUp,
  CreditCard
} from 'lucide-react';

const ActivityLedger = ({ transactions = [], loading }) => {
  // ── STATUS STYLING ENGINE ──
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'settled':
      case 'active':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'pending':
      case 'processing':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'rejected':
      case 'failed':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default:
        return 'text-gray-500 border-white/10 bg-white/5';
    }
  };

  // ── TYPE ICON ENGINE (Now including Investments) ──
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return <ArrowDownLeft className="text-emerald-400" size={18} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-rose-400" size={18} />;
      case 'investment':
      case 'subscription':
        return <TrendingUp className="text-blue-400" size={18} />;
      case 'roi_credit':
      case 'alpha':
        return <Zap className="text-amber-400" size={18} />;
      default:
        return <Fingerprint className="text-gray-400" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-20 text-center">
        <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
          <Shield className="text-gray-800" size={32} />
        </div>
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
          No Protocol Activity Detected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8 px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500/60 mb-1">
            <Clock size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Institutional Audit Log</span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">
            Protocol <span className="text-emerald-500">Ledger</span>
          </h3>
        </div>
        <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest hidden md:block">
          Node Sync: <span className="text-emerald-500">Stable</span>
        </div>
      </header>

      <div className="divide-y divide-white/5 bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        {transactions.map((tx, idx) => {
          const isPositive = ['deposit', 'roi_credit', 'alpha'].includes(tx.type?.toLowerCase());
          
          return (
            <div
              key={tx._id || idx}
              className="group px-8 py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] transition-all relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-6 flex-1">
                <div className="p-4 bg-black/40 border border-white/10 rounded-2xl group-hover:border-emerald-500/30 transition-colors">
                  {getTypeIcon(tx.type)}
                </div>
                
                <div>
                  <p className="text-white font-black uppercase tracking-widest text-sm italic flex items-center gap-2">
                    {tx.type?.replace('_', ' ') || 'Execution'}
                    <span className="text-[10px] text-gray-600 font-mono normal-case tracking-normal not-italic">
                      #{tx._id?.slice(-6).toUpperCase() || 'SYS-LOG'}
                    </span>
                  </p>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                    {new Date(tx.createdAt).toLocaleString()} • {tx.description || 'Verified Protocol'}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 text-right space-y-2">
                <p className={`text-xl font-black italic tracking-tighter ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
                  {isPositive ? '+' : '-'}€{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyles(tx.status)}`}>
                  {tx.status?.toLowerCase() === 'completed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                  {tx.status || 'Settled'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLedger;

